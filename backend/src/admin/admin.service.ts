import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  type ReportStatus,
  type ReportTargetType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import type { ResolveReportAction } from './dto/resolve-report.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';

const USER_SELECT = { id: true, name: true, email: true, role: true } as const;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // Any authenticated STUDENT may file a report; the controller enforces
  // that separately (admins act directly instead of filing reports).
  async createReport(reporterId: string, dto: CreateReportDto) {
    if (dto.targetType === 'LISTING') {
      const listing = await this.prisma.listing.findUnique({
        where: { id: dto.listingId },
        select: { id: true, title: true, sellerId: true },
      });
      if (!listing) {
        throw new NotFoundException('Inserat nicht gefunden.');
      }
      if (listing.sellerId === reporterId) {
        throw new ForbiddenException(
          'Du kannst dein eigenes Inserat nicht melden.',
        );
      }
      await this.assertNoOpenDuplicateReport(reporterId, {
        listingId: listing.id,
      });
      return this.prisma.report.create({
        data: {
          targetType: 'LISTING',
          listingId: listing.id,
          targetLabel: listing.title,
          reason: dto.reason,
          message: dto.message,
          reporterId,
        },
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: dto.reportedUserId },
      select: { id: true, name: true, email: true },
    });
    if (!user) {
      throw new NotFoundException('Nutzer nicht gefunden.');
    }
    if (user.id === reporterId) {
      throw new ForbiddenException('Du kannst dich nicht selbst melden.');
    }
    await this.assertNoOpenDuplicateReport(reporterId, {
      reportedUserId: user.id,
    });

    // Both are just admin-review context, not the report's target, so a
    // bad/missing value here doesn't block filing the report — it's simply
    // dropped instead. conversationId specifically is verified to actually
    // involve both the reporter and the reported user first: without that,
    // a client could attach an arbitrary conversationId to a report and
    // hand an admin a reason to open a private chat neither of them is
    // actually part of.
    const listingId =
      dto.listingId &&
      (await this.prisma.listing.findUnique({
        where: { id: dto.listingId },
        select: { id: true },
      }))
        ? dto.listingId
        : undefined;
    const conversationId =
      dto.conversationId &&
      (await this.isConversationBetween(
        dto.conversationId,
        reporterId,
        user.id,
      ))
        ? dto.conversationId
        : undefined;

    return this.prisma.report.create({
      data: {
        targetType: 'USER',
        reportedUserId: user.id,
        targetLabel: `${user.name} (${user.email})`,
        reason: dto.reason,
        message: dto.message,
        reporterId,
        listingId,
        conversationId,
      },
    });
  }

  private async isConversationBetween(
    conversationId: string,
    userAId: string,
    userBId: string,
  ): Promise<boolean> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true },
    });
    if (!conversation) return false;
    const participants = [conversation.buyerId, conversation.sellerId];
    return participants.includes(userAId) && participants.includes(userBId);
  }

  // Application-level dedup rather than a DB unique constraint — avoids a
  // schema migration against the live database, and correctly allows a NEW
  // report after an earlier one on the same target was already resolved
  // (only an OFFEN sibling blocks a new one).
  private async assertNoOpenDuplicateReport(
    reporterId: string,
    target: { listingId: string } | { reportedUserId: string },
  ): Promise<void> {
    const existing = await this.prisma.report.findFirst({
      where: { reporterId, status: 'OFFEN', ...target },
    });
    if (existing) {
      throw new ConflictException(
        'Du hast dieses Ziel bereits gemeldet. Die Meldung wird noch bearbeitet.',
      );
    }
  }

  // Joined with the LIVE listing/reportedUser (not just targetLabel) so
  // admin can click through and judge the actual current content — the
  // snapshot is only a fallback for once the target's gone.
  async listReports(status?: ReportStatus) {
    const reports = await this.prisma.report.findMany({
      where: status ? { status } : undefined,
      include: {
        reporter: { select: USER_SELECT },
        listing: {
          select: { id: true, title: true, status: true, images: true },
        },
        reportedUser: { select: USER_SELECT },
      },
      orderBy: { createdAt: 'desc' },
    });
    // OFFEN first, newest-first within each group — Array.prototype.sort is
    // stable, so the createdAt-desc order from the query is preserved within
    // each status group.
    return [...reports].sort((a, b) =>
      a.status === b.status ? 0 : a.status === 'OFFEN' ? -1 : 1,
    );
  }

  private assertActionMatchesTarget(
    action: ResolveReportAction,
    targetType: ReportTargetType,
  ): void {
    if (action === 'LISTING_DELETED' && targetType !== 'LISTING') {
      throw new BadRequestException(
        'Diese Aktion ist nur für gemeldete Inserate möglich.',
      );
    }
    if (
      (action === 'USER_WARNED' || action === 'USER_DELETED') &&
      targetType !== 'USER'
    ) {
      throw new BadRequestException(
        'Diese Aktion ist nur für gemeldete Nutzer möglich.',
      );
    }
  }

  // Atomic claim (conditional updateMany, same idiom as markSold/purchase/
  // withdraw/remove elsewhere in this codebase) BEFORE any side effect, so
  // two admins resolving the same report concurrently can't both succeed.
  // The action-vs-targetType shape check runs first, against an initial read
  // — safe to read-then-use here since listingId/reportedUserId are set once
  // at creation and never mutated afterward, so there's no TOCTOU window on
  // those specific fields.
  async resolveReport(id: string, adminId: string, dto: ResolveReportDto) {
    const existing = await this.prisma.report.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Meldung nicht gefunden.');
    }
    this.assertActionMatchesTarget(dto.action, existing.targetType);

    return this.prisma.$transaction(async (tx) => {
      const claimed = await tx.report.updateMany({
        where: { id, status: 'OFFEN' },
        data: { status: 'GESCHLOSSEN', resolvedAt: new Date() },
      });
      if (claimed.count === 0) {
        throw new ConflictException('Diese Meldung wurde bereits bearbeitet.');
      }

      if (dto.action === 'LISTING_DELETED') {
        if (existing.listingId) {
          await this.performListingDeletion(
            tx,
            existing.listingId,
            adminId,
            dto.note,
          );
        } else {
          await tx.auditLogEntry.create({
            data: {
              actorId: adminId,
              action: `Meldung geprüft — Inserat war bereits entfernt: ${dto.note}`,
            },
          });
        }
      } else if (dto.action === 'USER_WARNED') {
        if (existing.reportedUserId) {
          await tx.user.update({
            where: { id: existing.reportedUserId },
            data: { warningMessage: dto.note },
          });
          const user = await tx.user.findUniqueOrThrow({
            where: { id: existing.reportedUserId },
            select: { name: true, email: true },
          });
          await tx.auditLogEntry.create({
            data: {
              actorId: adminId,
              action: `Nutzer "${user.name}" (${user.email}) verwarnt: ${dto.note}`,
              targetType: 'USER',
              targetId: existing.reportedUserId,
            },
          });
        } else {
          await tx.auditLogEntry.create({
            data: {
              actorId: adminId,
              action: `Meldung geprüft — Nutzer existiert nicht mehr: ${dto.note}`,
            },
          });
        }
      } else if (dto.action === 'USER_DELETED') {
        if (existing.reportedUserId) {
          await this.performUserDeletion(
            tx,
            existing.reportedUserId,
            adminId,
            dto.note!,
          );
        } else {
          await tx.auditLogEntry.create({
            data: {
              actorId: adminId,
              action: `Meldung geprüft — Nutzer existiert nicht mehr: ${dto.note}`,
            },
          });
        }
      } else {
        await tx.auditLogEntry.create({
          data: {
            actorId: adminId,
            action: `Meldung "${existing.targetLabel}" ohne Maßnahme geschlossen${dto.note ? `: ${dto.note}` : ''}`,
            targetType: existing.targetType,
            targetId:
              existing.listingId ?? existing.reportedUserId ?? undefined,
          },
        });
      }

      return tx.report.findUniqueOrThrow({ where: { id } });
    });
  }

  async listUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        verified: true,
        balanceCents: true,
        createdAt: true,
        _count: { select: { reportsReceived: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return users.map(({ _count, ...user }) => ({
      ...user,
      reportsReceivedCount: _count.reportsReceived,
    }));
  }

  async deleteUser(id: string, adminId: string, note: string): Promise<void> {
    await this.prisma.$transaction((tx) =>
      this.performUserDeletion(tx, id, adminId, note),
    );
  }

  async deleteListing(
    id: string,
    adminId: string,
    note?: string,
  ): Promise<void> {
    await this.prisma.$transaction((tx) =>
      this.performListingDeletion(tx, id, adminId, note),
    );
  }

  async listAuditLog() {
    return this.prisma.auditLogEntry.findMany({
      include: { actor: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Shared by deleteListing() and resolveReport()'s LISTING_DELETED branch —
  // deletes unconditionally (admin override: any owner, any status), unlike
  // the student-facing DELETE /listings/:id which stays owner+AKTIV-only.
  private async performListingDeletion(
    tx: Prisma.TransactionClient,
    listingId: string,
    adminId: string,
    note?: string,
  ): Promise<void> {
    const listing = await tx.listing.findUnique({
      where: { id: listingId },
      select: { title: true },
    });
    if (!listing) {
      throw new NotFoundException('Inserat nicht gefunden.');
    }
    // Close sibling reports BEFORE deleting the listing, not after: the
    // listing→Report relation is `onDelete: SetNull`, so the instant the
    // listing row is deleted, Postgres itself nulls out `listingId` on every
    // report that referenced it — including this query's own WHERE filter,
    // which would then match nothing. Two students can report the same bad
    // listing from different angles; without closing siblings first, the
    // second report would sit OFFEN forever once the first is acted on.
    await tx.report.updateMany({
      where: { listingId, status: 'OFFEN' },
      data: { status: 'GESCHLOSSEN', resolvedAt: new Date() },
    });
    const deleted = await tx.listing.deleteMany({ where: { id: listingId } });
    if (deleted.count === 0) {
      throw new ConflictException('Inserat wurde bereits gelöscht.');
    }
    await tx.auditLogEntry.create({
      data: {
        actorId: adminId,
        action: `Inserat "${listing.title}" gelöscht${note ? `: ${note}` : ''}`,
        targetType: 'LISTING',
        targetId: listingId,
      },
    });
  }

  // Shared by deleteUser() and resolveReport()'s USER_DELETED branch. Blocks
  // self-deletion and deleting ADMIN-role accounts, and blocks deletion
  // entirely while the user has any AKTIV listings — forcing those to be
  // resolved first via performListingDeletion — rather than cascading, which
  // would otherwise silently wipe OTHER students' favorites on those
  // listings (Favorite.listingId already cascades) and destroy the only
  // record a completed sale ever happened (there's no separate
  // Order/Transaction model; the Listing row IS the transaction record).
  // VERKAUFT listings survive with sellerId set to null (see schema.prisma).
  // Explicit non-goal: this does not reverse or refund any balanceCents
  // movement the user was ever party to.
  private async performUserDeletion(
    tx: Prisma.TransactionClient,
    userId: string,
    adminId: string,
    note: string,
  ): Promise<void> {
    if (userId === adminId) {
      throw new ForbiddenException(
        'Du kannst dein eigenes Konto nicht über den Admin-Bereich löschen.',
      );
    }
    const target = await tx.user.findUnique({
      where: { id: userId },
      select: { role: true, name: true, email: true },
    });
    if (!target) {
      throw new NotFoundException('Nutzer nicht gefunden.');
    }
    if (target.role === 'ADMIN') {
      throw new ForbiddenException(
        'Admin-Konten können nicht gelöscht werden.',
      );
    }
    const activeListingCount = await tx.listing.count({
      where: { sellerId: userId, status: 'AKTIV' },
    });
    if (activeListingCount > 0) {
      throw new ConflictException(
        'Dieser Nutzer hat noch aktive Inserate. Bitte lösche diese zuerst.',
      );
    }

    // Close sibling reports BEFORE deleting the user, not after — same
    // reasoning as performListingDeletion: User→Report is `onDelete:
    // SetNull`, so deleting the user row would otherwise null out
    // `reportedUserId` on sibling reports before this filter ever runs.
    await tx.report.updateMany({
      where: { reportedUserId: userId, status: 'OFFEN' },
      data: { status: 'GESCHLOSSEN', resolvedAt: new Date() },
    });
    const deleted = await tx.user.deleteMany({
      where: { id: userId, role: 'STUDENT', NOT: { id: adminId } },
    });
    if (deleted.count === 0) {
      throw new ConflictException('Nutzer wurde bereits gelöscht.');
    }
    await tx.auditLogEntry.create({
      data: {
        actorId: adminId,
        action: `Nutzer "${target.name}" (${target.email}) gelöscht: ${note}`,
        targetType: 'USER',
        targetId: userId,
      },
    });
  }
}

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { validateMockCard } from '../payments/mock-card';
import { CreateListingDto } from './dto/create-listing.dto';
import { PurchaseListingDto } from './dto/purchase-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

const SELLER_SELECT = { name: true, verified: true } as const;

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.listing.findMany({
      include: { seller: { select: SELLER_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { seller: { select: SELLER_SELECT } },
    });
    if (!listing) {
      throw new NotFoundException('Inserat nicht gefunden.');
    }
    return listing;
  }

  async create(sellerId: string, role: string, dto: CreateListingDto) {
    if (role !== 'STUDENT') {
      throw new ForbiddenException(
        'Admin-Konten können keine Inserate erstellen.',
      );
    }

    return this.prisma.listing.create({
      data: { ...dto, sellerId },
      include: { seller: { select: SELLER_SELECT } },
    });
  }

  async update(id: string, userId: string, dto: UpdateListingDto) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      throw new NotFoundException('Inserat nicht gefunden.');
    }
    if (listing.sellerId !== userId) {
      throw new ForbiddenException('Du kannst nur eigene Inserate bearbeiten.');
    }

    return this.prisma.listing.update({
      where: { id },
      data: dto,
      include: { seller: { select: SELLER_SELECT } },
    });
  }

  // Deliberately no ownership check: the seller can self-mark their own
  // listing sold from the edit page, with no payment involved. (Buyer-paid
  // purchases go through `purchase()` below, which does check ownership.)
  // After that split, this route is still callable directly by anyone
  // authenticated for €0 — a documented, pre-existing, still-accepted gap,
  // not something this change closes.
  //
  // Uses a conditional `updateMany` rather than a plain findUnique+update:
  // two concurrent calls could otherwise both read `AKTIV` before either
  // writes, and both then succeed, since a plain `.update()` has no way to
  // reject based on the row's state at write time. `UPDATE ... WHERE status
  // = 'AKTIV'` re-evaluates that predicate against the latest *committed*
  // row when a concurrent writer has to wait on the lock, so the loser
  // genuinely gets `count: 0` under Postgres's default READ COMMITTED.
  //
  // `buyerId` is optional and only ever passed by purchase()'s simulation
  // branch below — the self-service PATCH :id/sold route (no real buyer)
  // calls this with no second argument, leaving buyerId untouched.
  async markSold(id: string, buyerId?: string) {
    const result = await this.prisma.listing.updateMany({
      where: { id, status: 'AKTIV' },
      data: { status: 'VERKAUFT', ...(buyerId ? { buyerId } : {}) },
    });
    if (result.count === 0) {
      const exists = await this.prisma.listing.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!exists) {
        throw new NotFoundException('Inserat nicht gefunden.');
      }
      throw new ConflictException('Dieses Inserat ist bereits verkauft.');
    }

    return this.prisma.listing.findUniqueOrThrow({
      where: { id },
      include: { seller: { select: SELLER_SELECT } },
    });
  }

  // Buyer-paid purchase: 'simulation' validates a mock credit card and never
  // touches balance ("no money moves"); 'guthaben' atomically debits the
  // buyer, credits the seller, and flips the listing to VERKAUFT — or rolls
  // back entirely if any of those three checks fails. Both the listing
  // status gate and the buyer-balance gate use the same conditional
  // `updateMany` pattern as `markSold`: wrapping plain reads-then-writes in
  // `$transaction` alone would NOT prevent two concurrent purchases from
  // both passing their checks before either writes, which would double-sell
  // the listing and double-charge/credit both sides.
  async purchase(id: string, buyerId: string, dto: PurchaseListingDto) {
    if (dto.paymentMethod === 'simulation') {
      validateMockCard(dto.card!);
      return this.markSold(id, buyerId);
    }

    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      throw new NotFoundException('Inserat nicht gefunden.');
    }
    if (listing.sellerId === buyerId) {
      throw new ForbiddenException(
        'Du kannst dein eigenes Inserat nicht kaufen.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const sold = await tx.listing.updateMany({
        where: { id, status: 'AKTIV' },
        data: { status: 'VERKAUFT', buyerId },
      });
      if (sold.count === 0) {
        throw new ConflictException('Dieses Inserat ist bereits verkauft.');
      }

      const debited = await tx.user.updateMany({
        where: { id: buyerId, balanceCents: { gte: listing.priceCents } },
        data: { balanceCents: { decrement: listing.priceCents } },
      });
      if (debited.count === 0) {
        throw new BadRequestException(
          'Nicht genügend Guthaben für diesen Kauf.',
        );
      }

      // sellerId is nullable at the schema level (a seller's account can be
      // deleted after their listing sells — see AdminService), but an AKTIV
      // listing can never reach that state: admin deletion is blocked while
      // a user still has any AKTIV listings, precisely to prevent this from
      // happening mid-purchase.
      if (!listing.sellerId) {
        throw new ConflictException(
          'Der Verkäufer dieses Inserats existiert nicht mehr.',
        );
      }

      await tx.user.update({
        where: { id: listing.sellerId },
        data: { balanceCents: { increment: listing.priceCents } },
      });

      const buyer = await tx.user.findUniqueOrThrow({
        where: { id: buyerId },
        select: { balanceCents: true },
      });
      const updated = await tx.listing.findUniqueOrThrow({
        where: { id },
        include: { seller: { select: SELLER_SELECT } },
      });
      return { ...updated, buyerBalanceCents: buyer.balanceCents };
    });
  }

  // Owner-only, AKTIV-only. A single atomic conditional delete, not
  // check-then-delete: a plain delete performed after separate ownership
  // and status checks could race a concurrent purchase completing on the
  // same listing (`purchase()` above flips status to VERKAUFT and sets
  // buyerId inside its own transaction) — exactly the scenario the
  // VERKAUFT-block exists to prevent (a buyer's future purchase record
  // getting destroyed), just reached via a race instead of a direct call.
  async remove(id: string, userId: string): Promise<void> {
    const result = await this.prisma.listing.deleteMany({
      where: { id, sellerId: userId, status: 'AKTIV' },
    });

    if (result.count === 0) {
      const listing = await this.prisma.listing.findUnique({
        where: { id },
        select: { sellerId: true, status: true },
      });
      if (!listing) {
        throw new NotFoundException('Inserat nicht gefunden.');
      }
      if (listing.sellerId !== userId) {
        throw new ForbiddenException('Du kannst nur eigene Inserate löschen.');
      }
      throw new ConflictException(
        'Verkaufte Inserate können nicht gelöscht werden.',
      );
    }
  }

  async addFavorite(userId: string, listingId: string) {
    await this.findOne(listingId);
    await this.prisma.favorite.upsert({
      where: { userId_listingId: { userId, listingId } },
      update: {},
      create: { userId, listingId },
    });
  }

  async removeFavorite(userId: string, listingId: string) {
    await this.prisma.favorite.deleteMany({ where: { userId, listingId } });
  }

  async listFavoriteIds(userId: string): Promise<string[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      select: { listingId: true },
    });
    return favorites.map((favorite) => favorite.listingId);
  }
}

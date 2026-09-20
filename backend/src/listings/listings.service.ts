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
      throw new ForbiddenException('Admin-Konten können keine Inserate erstellen.');
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
    if (listing.status === 'VERKAUFT') {
      throw new ConflictException('Verkaufte Inserate können nicht mehr bearbeitet werden.');
    }

    return this.prisma.listing.update({
      where: { id },
      data: dto,
      include: { seller: { select: SELLER_SELECT } },
    });
  }

  // Self-service route only: the seller marks their own listing sold from
  // the edit page, with no payment involved. Previously had no ownership
  // check at all — any authenticated student could PATCH any other
  // student's listing to VERKAUFT for free, which is a real griefing
  // vector on a marketplace (silently kill a competitor's active listing).
  // Now requires the caller to be that listing's seller, or an admin.
  async markSold(id: string, userId: string, role: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id }, select: { sellerId: true } });
    if (!listing) {
      throw new NotFoundException('Inserat nicht gefunden.');
    }
    if (role !== 'ADMIN' && listing.sellerId !== userId) {
      throw new ForbiddenException('Du kannst nur eigene Inserate als verkauft markieren.');
    }
    return this.markSoldInternal(id);
  }

  // Uses a conditional `updateMany` rather than a plain findUnique+update:
  // two concurrent calls could otherwise both read `AKTIV` before either
  // writes, and both then succeed, since a plain `.update()` has no way to
  // reject based on the row's state at write time. `UPDATE ... WHERE status
  // = 'AKTIV'` re-evaluates that predicate against the latest *committed*
  // row when a concurrent writer has to wait on the lock, so the loser
  // genuinely gets `count: 0` under Postgres's default READ COMMITTED.
  //
  // `buyerId` is optional and only ever passed by purchase()'s simulation
  // branch below — markSold() above (the self-service route, no real buyer)
  // calls this with no second argument, leaving buyerId untouched.
  private async markSoldInternal(id: string, buyerId?: string) {
    const result = await this.prisma.listing.updateMany({
      where: { id, status: 'AKTIV' },
      data: { status: 'VERKAUFT', ...(buyerId ? { buyerId } : {}) },
    });
    if (result.count === 0) {
      const exists = await this.prisma.listing.findUnique({ where: { id }, select: { id: true } });
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
  // `updateMany` pattern as `markSoldInternal`: wrapping plain reads-then-
  // writes in `$transaction` alone would NOT prevent two concurrent
  // purchases from both passing their checks before either writes, which
  // would double-sell the listing and double-charge/credit both sides.
  async purchase(id: string, buyerId: string, role: string, dto: PurchaseListingDto) {
    if (dto.paymentMethod === 'simulation') {
      // No balance change here on purpose — Simulation stays a no-money
      // demo of the card-checkout UI. It still needs the same eligibility
      // guards as a real purchase, though: without these, any student
      // could mark ANY listing sold for free, including one with
      // Sofortkauf disabled, their own, or (since there was no role check)
      // even an admin account could "buy" something.
      if (role !== 'STUDENT') {
        throw new ForbiddenException('Nur Studierende können Inserate kaufen.');
      }
      const listing = await this.prisma.listing.findUnique({
        where: { id },
        select: { sellerId: true, sofortkaufMoeglich: true },
      });
      if (!listing) {
        throw new NotFoundException('Inserat nicht gefunden.');
      }
      if (!listing.sofortkaufMoeglich) {
        throw new ForbiddenException('Für dieses Inserat ist kein Sofortkauf möglich.');
      }
      if (listing.sellerId === buyerId) {
        throw new ForbiddenException('Du kannst dein eigenes Inserat nicht kaufen.');
      }
      validateMockCard(dto.card!);
      return this.markSoldInternal(id, buyerId);
    }

    // Same eligibility guards as the simulation branch above — without them
    // a Guthaben purchase could buy a Sofortkauf-disabled listing, or (since
    // balanceCents exists on every User row regardless of role) let an admin
    // account buy one too.
    if (role !== 'STUDENT') {
      throw new ForbiddenException('Nur Studierende können Inserate kaufen.');
    }
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      throw new NotFoundException('Inserat nicht gefunden.');
    }
    if (!listing.sofortkaufMoeglich) {
      throw new ForbiddenException('Für dieses Inserat ist kein Sofortkauf möglich.');
    }
    if (listing.sellerId === buyerId) {
      throw new ForbiddenException('Du kannst dein eigenes Inserat nicht kaufen.');
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
        throw new BadRequestException('Nicht genügend Guthaben für diesen Kauf.');
      }

      // sellerId is nullable at the schema level (a seller's account can be
      // deleted after their listing sells — see AdminService), but an AKTIV
      // listing can never reach that state: admin deletion is blocked while
      // a user still has any AKTIV listings, precisely to prevent this from
      // happening mid-purchase.
      if (!listing.sellerId) {
        throw new ConflictException('Der Verkäufer dieses Inserats existiert nicht mehr.');
      }

      await tx.user.update({
        where: { id: listing.sellerId },
        data: { balanceCents: { increment: listing.priceCents } },
      });

      const buyer = await tx.user.findUniqueOrThrow({ where: { id: buyerId }, select: { balanceCents: true } });
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
      const listing = await this.prisma.listing.findUnique({ where: { id }, select: { sellerId: true, status: true } });
      if (!listing) {
        throw new NotFoundException('Inserat nicht gefunden.');
      }
      if (listing.sellerId !== userId) {
        throw new ForbiddenException('Du kannst nur eigene Inserate löschen.');
      }
      throw new ConflictException('Verkaufte Inserate können nicht gelöscht werden.');
    }
  }

  async addFavorite(userId: string, listingId: string) {
    const listing = await this.findOne(listingId);
    if (listing.sellerId === userId) {
      throw new ForbiddenException(
        'Du kannst eigene Inserate nicht zu deinen Favoriten hinzufügen.',
      );
    }
    if (listing.status !== 'AKTIV') {
      throw new ForbiddenException(
        'Verkaufte Inserate können nicht favorisiert werden.',
      );
    }
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

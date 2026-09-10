import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
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

    return this.prisma.listing.update({
      where: { id },
      data: dto,
      include: { seller: { select: SELLER_SELECT } },
    });
  }

  // Bewusst keine Besitzprüfung: Ein Inserat wird entweder vom eigenen
  // Verkäufer selbst (über die Bearbeiten-Seite) oder von einem anderen
  // Studenten, der den Mock-Checkout abschließt, als verkauft markiert. Bis
  // Phase 5 (Transaktions-Verwaltung) gibt es keine gespeicherte
  // Transaktion, das Backend kann also noch nicht unterscheiden zwischen
  // "ein Käufer, der wirklich den Checkout durchlaufen hat" und "irgendein
  // eingeloggter Student, der diese Route direkt aufruft". Die AKTIV-Prüfung
  // begrenzt den Schaden auf einen einmaligen, einseitigen Übergang — das
  // ist eine bewusste, befristete Phasen-Grenze, kein Versehen.
  async markSold(id: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      throw new NotFoundException('Inserat nicht gefunden.');
    }
    if (listing.status !== 'AKTIV') {
      throw new ConflictException('Dieses Inserat ist bereits verkauft.');
    }

    return this.prisma.listing.update({
      where: { id },
      data: { status: 'VERKAUFT' },
      include: { seller: { select: SELLER_SELECT } },
    });
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
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListingsService } from './listings.service';

describe('ListingsService favorites', () => {
  const prisma = {
    listing: { findUnique: jest.fn() },
    favorite: { upsert: jest.fn(), deleteMany: jest.fn() },
  };
  let service: ListingsService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new ListingsService(prisma as unknown as PrismaService);
  });

  it('rejects favoriting an own listing without writing a favorite', async () => {
    prisma.listing.findUnique.mockResolvedValue({
      id: 'listing',
      sellerId: 'owner',
    });

    await expect(
      service.addFavorite('owner', 'listing'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.favorite.upsert).not.toHaveBeenCalled();
  });

  it("still allows favoriting another user's listing", async () => {
    prisma.listing.findUnique.mockResolvedValue({
      id: 'listing',
      sellerId: 'seller',
      status: 'AKTIV',
    });

    await expect(
      service.addFavorite('buyer', 'listing'),
    ).resolves.toBeUndefined();
    expect(prisma.favorite.upsert).toHaveBeenCalledWith({
      where: { userId_listingId: { userId: 'buyer', listingId: 'listing' } },
      update: {},
      create: { userId: 'buyer', listingId: 'listing' },
    });
  });

  it('rejects favoriting a sold listing without writing a favorite', async () => {
    prisma.listing.findUnique.mockResolvedValue({
      id: 'listing',
      sellerId: 'seller',
      status: 'VERKAUFT',
    });

    await expect(
      service.addFavorite('buyer', 'listing'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.favorite.upsert).not.toHaveBeenCalled();
  });

  it('rejects missing listings without writing a favorite', async () => {
    prisma.listing.findUnique.mockResolvedValue(null);

    await expect(
      service.addFavorite('buyer', 'missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.favorite.upsert).not.toHaveBeenCalled();
  });

  it('allows removing an own listing favorited before this restriction', async () => {
    await expect(
      service.removeFavorite('owner', 'listing'),
    ).resolves.toBeUndefined();
    expect(prisma.favorite.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'owner', listingId: 'listing' },
    });
  });
});

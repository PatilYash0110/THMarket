import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { validateMockCard } from '../payments/mock-card';
import { TopUpDto } from './dto/top-up.dto';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  // No race to guard here (unlike listings.purchase): a user topping up
  // their own balance isn't a contested resource — two concurrent top-ups
  // both succeeding is correct, not a bug, so a plain `update` is fine.
  async topUp(userId: string, dto: TopUpDto): Promise<{ balanceCents: number }> {
    validateMockCard(dto.card);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { balanceCents: { increment: dto.amountCents } },
    });

    return { balanceCents: user.balanceCents };
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { validateMockCard } from '../payments/mock-card';
import { TopUpDto } from './dto/top-up.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  // No race to guard here (unlike withdraw, or listings.purchase): a user
  // topping up their own balance isn't a contested resource — two
  // concurrent top-ups both succeeding is correct, not a bug, so a plain
  // `update` is fine.
  async topUp(userId: string, dto: TopUpDto): Promise<{ balanceCents: number }> {
    validateMockCard(dto.card);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { balanceCents: { increment: dto.amountCents } },
    });

    return { balanceCents: user.balanceCents };
  }

  // Unlike topUp, this DOES need the conditional-write gate: two concurrent
  // withdrawal requests for the same user's full balance could otherwise
  // both read a sufficient balance before either writes and both succeed,
  // overdrawing the account — the same class of race already found and
  // fixed in listings.service.ts's markSold/purchase.
  async withdraw(userId: string, dto: WithdrawDto): Promise<{ balanceCents: number }> {
    validateMockCard(dto.card);

    const result = await this.prisma.user.updateMany({
      where: { id: userId, balanceCents: { gte: dto.amountCents } },
      data: { balanceCents: { decrement: dto.amountCents } },
    });
    if (result.count === 0) {
      throw new BadRequestException('Nicht genügend Guthaben für diese Auszahlung.');
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { balanceCents: true },
    });
    return { balanceCents: user.balanceCents };
  }
}

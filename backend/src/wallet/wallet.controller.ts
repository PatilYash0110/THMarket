import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.strategy';
import { TopUpDto } from './dto/top-up.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // Throttled — each call is a legitimate self-operation (a student can
  // only ever move their own balance), but with no rate limit at all a
  // script could hammer this to accumulate arbitrary fake balance far
  // faster than a human clicking "Aufladen" ever would.
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Post('topup')
  topUp(@CurrentUser() user: JwtPayload, @Body() dto: TopUpDto) {
    return this.walletService.topUp(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Post('withdraw')
  withdraw(@CurrentUser() user: JwtPayload, @Body() dto: WithdrawDto) {
    return this.walletService.withdraw(user.sub, dto);
  }
}

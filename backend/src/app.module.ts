import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ListingsModule } from './listings/listings.module';
import { PrismaModule } from './prisma/prisma.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Not registered as a global guard — only the public, mail-sending auth
    // routes (register, resend-verification, forgot-password) opt in via
    // @UseGuards(ThrottlerGuard), so the rest of the API is unaffected.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 5 }]),
    PrismaModule,
    AuthModule,
    ListingsModule,
    WalletModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

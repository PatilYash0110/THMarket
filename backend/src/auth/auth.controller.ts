import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { AccountThrottlerGuard } from './account-throttler.guard';
import {
  AUTH_COOKIE_NAME,
  buildAuthCookieOptions,
  buildClearAuthCookieOptions,
} from './auth-cookie';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { JwtPayload } from './jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  // Throttled: public, unauthenticated, and triggers an outbound email —
  // without a limit, a script iterating over addresses could exhaust the
  // Gmail account's daily send quota and break email delivery for everyone.
  // A higher limit than login/forgot-password: guards run before the
  // validation pipe in Nest's request pipeline, so DTO validation failures
  // (a password typo, a missing field) consume this budget exactly like a
  // real submission — this endpoint isn't a password-guessing oracle the
  // way login is, so it can afford more headroom for input mistakes.
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @UseGuards(ThrottlerGuard)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('verify-email')
  verifyEmail(@Query('token') token?: string) {
    // A missing/blank token previously reached Prisma's findUnique as
    // `undefined`, which throws a validation error there instead of a
    // normal 400 — mapped to the same "invalid link" response the service
    // already uses for an unrecognized token.
    if (!token) {
      throw new BadRequestException(
        'Der Bestätigungslink ist ungültig oder abgelaufen.',
      );
    }
    return this.authService.verifyEmail(token);
  }

  @UseGuards(ThrottlerGuard)
  @Post('resend-verification')
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto);
  }

  // Throttled like the other public, unauthenticated auth routes — without
  // it, this is a plain unlimited password-guessing oracle against any
  // known @thm.de address (bcrypt slows a single guess down, not a script
  // making thousands of them). Keyed on email+IP (AccountThrottlerGuard),
  // not IP alone: campus NAT shares one IP across many students, so a
  // plain IP bucket would let one targeted account's guesses starve
  // everyone else's login attempts on the same connection.
  @UseGuards(AccountThrottlerGuard)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, user } = await this.authService.login(dto);
    res.cookie(
      AUTH_COOKIE_NAME,
      accessToken,
      buildAuthCookieOptions(this.config.get<string>('JWT_EXPIRES_IN') ?? '7d'),
    );
    // accessToken itself never reaches the response body — it lives only in
    // the httpOnly cookie set above, so page JS (including an XSS payload)
    // has no way to read it out, unlike the old localStorage-based flow.
    return { user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE_NAME, buildClearAuthCookieOptions());
    return { loggedOut: true };
  }

  @UseGuards(AccountThrottlerGuard)
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.me(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('dismiss-warning')
  dismissWarning(@CurrentUser() user: JwtPayload) {
    return this.authService.dismissWarning(user.sub);
  }
}

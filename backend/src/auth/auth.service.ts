import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESEND_VERIFICATION_COOLDOWN_MS = 60 * 1000;
// Shorter than the verification TTL on purpose: a live password-reset link
// sitting in an inbox is a real account-takeover window if that inbox is
// ever compromised or shared, unlike a verification link (worst case there
// is someone else marking your email verified — no password exposure).
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const BCRYPT_ROUNDS = 12;
// Generic response for both resend-verification and forgot-password so
// neither endpoint leaks whether a given @thm.de address has an account.
const GENERIC_RESET_MESSAGE = 'Falls ein Konto mit dieser E-Mail existiert, wurde eine E-Mail gesendet.';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'ADMIN';
  verified: boolean;
  balanceCents: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  private toPublicUser(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    verified: boolean;
    balanceCents: number;
  }): PublicUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'STUDENT' | 'ADMIN',
      verified: user.verified,
      balanceCents: user.balanceCents,
    };
  }

  private generateVerificationToken(): { token: string; expires: Date } {
    return {
      token: randomBytes(32).toString('hex'),
      expires: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
    };
  }

  async register(dto: RegisterDto): Promise<{ email: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Diese E-Mail-Adresse ist bereits registriert.');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const { token: emailVerificationToken, expires: emailVerificationExpires } =
      this.generateVerificationToken();

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        emailVerificationToken,
        emailVerificationExpires,
        emailVerificationSentAt: new Date(),
      },
    });

    const verifyUrl = `${this.config.getOrThrow<string>('FRONTEND_URL')}/verify-email?token=${emailVerificationToken}`;
    await this.mail.sendVerificationEmail(user.email, user.name, verifyUrl);

    return { email: user.email };
  }

  async verifyEmail(token: string): Promise<{ email: string }> {
    const user = await this.prisma.user.findUnique({ where: { emailVerificationToken: token } });

    if (!user || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      throw new NotFoundException('Der Bestätigungslink ist ungültig oder abgelaufen.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return { email: user.email };
  }

  // Always resolves to the same shape, whether or not the email exists or is
  // already verified — this endpoint is public and unauthenticated, so it
  // must not become a way to check which @thm.de addresses are registered.
  async resendVerification(dto: ResendVerificationDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (user && !user.verified) {
      if (
        user.emailVerificationSentAt &&
        Date.now() - user.emailVerificationSentAt.getTime() < RESEND_VERIFICATION_COOLDOWN_MS
      ) {
        throw new BadRequestException(
          'Bitte warte eine Minute, bevor du einen neuen Bestätigungslink anforderst.',
        );
      }

      const { token: emailVerificationToken, expires: emailVerificationExpires } =
        this.generateVerificationToken();

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken,
          emailVerificationExpires,
          emailVerificationSentAt: new Date(),
        },
      });

      const verifyUrl = `${this.config.getOrThrow<string>('FRONTEND_URL')}/verify-email?token=${emailVerificationToken}`;
      await this.mail.sendVerificationEmail(user.email, user.name, verifyUrl);
    }

    return { message: GENERIC_RESET_MESSAGE };
  }

  // Deliberately always returns the same generic message, whether or not the
  // email exists — stricter than register()'s 409 (which is a different kind
  // of endpoint: claiming an identity, not just requesting an email) since a
  // THM-only, real-name platform shouldn't leak account existence here.
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (user) {
      const passwordResetToken = randomBytes(32).toString('hex');
      const passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordResetToken, passwordResetExpires },
      });

      const resetUrl = `${this.config.getOrThrow<string>('FRONTEND_URL')}/reset-password?token=${passwordResetToken}`;
      await this.mail.sendPasswordResetEmail(user.email, user.name, resetUrl);
    }

    return { message: GENERIC_RESET_MESSAGE };
  }

  // Atomic conditional write, not read-then-write: two near-simultaneous
  // submits of the same reset token could otherwise both pass a separate
  // expiry check before either writes, and both appear to succeed. Same
  // idiom as listings.service.ts's markSold/purchase.
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);

    const result = await this.prisma.user.updateMany({
      where: { passwordResetToken: dto.token, passwordResetExpires: { gt: new Date() } },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        passwordChangedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new BadRequestException('Der Link zum Zurücksetzen ist ungültig oder abgelaufen.');
    }

    return { message: 'Passwort erfolgreich zurückgesetzt.' };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: PublicUser }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Ungültige E-Mail-Adresse oder Passwort.');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Ungültige E-Mail-Adresse oder Passwort.');
    }

    if (!user.verified) {
      throw new ForbiddenException('Bitte bestätige zuerst deine E-Mail-Adresse.');
    }

    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role });

    return { accessToken, user: this.toPublicUser(user) };
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Nutzer nicht gefunden.');
    }
    return this.toPublicUser(user);
  }
}

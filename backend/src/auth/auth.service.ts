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
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESEND_VERIFICATION_COOLDOWN_MS = 60 * 1000;
const BCRYPT_ROUNDS = 12;
// Generic response for resend-verification so the endpoint doesn't leak
// which @thm.de addresses are registered or already verified.
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

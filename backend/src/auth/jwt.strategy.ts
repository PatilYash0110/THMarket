import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  role: 'STUDENT' | 'ADMIN';
  // Standard JWT claim, added automatically by the signing library — never
  // set explicitly when constructing a payload to sign.
  iat?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Rejects tokens issued before the user's last password change/reset.
  // JWTs are otherwise stateless — without this, a password reset done
  // because of a suspected compromise would accomplish nothing, since a
  // token issued before the reset keeps working until it naturally expires
  // (JWT_EXPIRES_IN, up to 7 days).
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { passwordChangedAt: true },
    });

    if (user?.passwordChangedAt && payload.iat && payload.iat * 1000 < user.passwordChangedAt.getTime()) {
      throw new UnauthorizedException('Sitzung abgelaufen. Bitte melde dich erneut an.');
    }

    return payload;
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AUTH_COOKIE_NAME } from './auth-cookie';
import { assertSessionStillValid } from './session-validation';

export interface JwtPayload {
  sub: string;
  role: 'STUDENT' | 'ADMIN';
  // Standard JWT claim, added automatically by the signing library — never
  // set explicitly when constructing a payload to sign.
  iat?: number;
}

// Cookie first (the browser flow, set by AuthController.login as httpOnly —
// invisible to JS, so an XSS payload can no longer read it out of
// localStorage the way the previous token storage allowed), falling back to
// a Bearer header so non-browser clients (curl, Postman, tests) still work.
function cookieExtractor(req: Request): string | null {
  return req?.cookies?.[AUTH_COOKIE_NAME] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor, ExtractJwt.fromAuthHeaderAsBearerToken()]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Rejects tokens issued before the user's last password change/reset, or
  // belonging to a since-deleted account. JWTs are otherwise stateless —
  // without this, a password reset done because of a suspected compromise
  // would accomplish nothing, since a token issued before the reset keeps
  // working until it naturally expires (JWT_EXPIRES_IN, up to 7 days).
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    await assertSessionStillValid(this.prisma, payload.sub, payload.iat);
    return payload;
  }
}

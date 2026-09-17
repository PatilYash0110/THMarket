import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../auth/jwt.strategy';

// Every route in AdminController except report creation is privilege-
// sensitive (list all users' data, hard-delete accounts, delete arbitrary
// listings) — a real guard, not a copy-pasted inline role check, is the
// right shape here (unlike ListingsService.create()'s single inline check,
// which suits one method in an otherwise-open controller).
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    return request.user?.role === 'ADMIN';
  }
}

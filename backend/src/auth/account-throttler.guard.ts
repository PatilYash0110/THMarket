import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

// Keys the rate limit on email+IP instead of the library's IP-only default.
// IP-only is both bypassable (any proxy changes it) and unfair here: campus
// NAT puts hundreds of students behind one shared IP, so one student's
// lockout would throttle everyone else's login attempts too.
@Injectable()
export class AccountThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    const request = req as { body?: { email?: unknown }; ip?: string };
    const email =
      typeof request.body?.email === 'string'
        ? request.body.email.toLowerCase()
        : 'unknown';
    return Promise.resolve(`${email}:${request.ip}`);
  }
}

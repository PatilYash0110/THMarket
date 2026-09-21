import type { CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'thmarket_token';

// "7d" / "24h" / "60m" / "30s" — the same shorthand JWT_EXPIRES_IN is always
// given in here, parsed once so the cookie's own maxAge can't drift out of
// sync with the token's real lifetime.
function parseDurationMs(value: string): number {
  const match = /^(\d+)\s*(s|m|h|d)$/i.exec(value.trim());
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }
  const amount = Number(match[1]);
  const unitMs: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return amount * unitMs[match[2].toLowerCase()];
}

// SameSite=None is required, not optional, once secure is true: the
// frontend (Vercel) and backend (Render) are different registrable
// domains, so every real request between them is cross-site — Lax would
// simply never send the cookie. That only works over HTTPS, hence pairing
// it with `secure`, which is also why dev (plain http://localhost) needs
// the Lax/non-secure combination instead.
//
// `partitioned` (CHIPS) is the piece that actually makes this cookie
// survive in Safari and Chrome-Incognito: both now block SameSite=None
// third-party cookies by default with no exception, so without this flag
// the browser accepts the Set-Cookie from login but never stores it —
// every request afterward looks logged-out. Partitioned scopes storage to
// "this cookie, as seen while browsing thmarket.vercel.app" specifically,
// which both engines still allow. Requires secure + SameSite=None (already
// true here), so this stays production-only alongside them.
function baseAuthCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    partitioned: isProd,
    path: '/',
  };
}

export function buildAuthCookieOptions(jwtExpiresIn: string): CookieOptions {
  return {
    ...baseAuthCookieOptions(),
    maxAge: parseDurationMs(jwtExpiresIn),
  };
}

// clearCookie() only actually clears the cookie the browser is holding if
// every attribute that identifies it (secure/sameSite/partitioned/path)
// matches what it was set with — a bare `{ path: '/' }` clears a plain
// cookie fine, but leaves a Partitioned one behind, so logout wouldn't
// really log the browser out on the affected browsers.
export function buildClearAuthCookieOptions(): CookieOptions {
  return baseAuthCookieOptions();
}

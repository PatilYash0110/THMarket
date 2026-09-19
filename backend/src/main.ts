import { setDefaultResultOrder } from 'dns';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Render sits directly behind Cloudflare — one hop — so `1` trusts only
  // that hop's X-Forwarded-For and makes req.ip the real client IP.
  // Without this, the login/forgot-password throttler keys on Cloudflare's
  // edge IP for every request, not the actual caller.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(helmet());
  app.use(cookieParser());

  // Lightweight CSRF defense: the JWT now travels in an httpOnly cookie
  // (see AuthController.login), which the browser attaches automatically —
  // including to a forged cross-site request, unlike a header the attacker
  // can't set. SameSite alone can't fully cover this because the frontend
  // and backend are deployed on different origins (Vercel/Render), which
  // forces SameSite=None in production. Checking the browser-set Origin
  // header on state-changing requests closes that gap: a page on another
  // origin cannot spoof it. Missing Origin is let through rather than
  // rejected — that covers non-browser clients (curl, Postman, the mobile
  // app this API doesn't have yet), none of which carry the victim's
  // cookie in the first place, so they aren't a CSRF vector.
  app.use((req, res, next) => {
    if (SAFE_METHODS.has(req.method.toUpperCase())) {
      next();
      return;
    }
    const origin = req.headers.origin;
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      res.status(403).json({ message: 'Ungültiger Origin.' });
      return;
    }
    // A request with no Origin header but a cross-site Sec-Fetch-Site is
    // still cross-site — some browsers omit Origin in cases (POST via
    // navigation, older Safari) that Sec-Fetch-Site still flags correctly.
    if (!origin && req.headers['sec-fetch-site'] === 'cross-site') {
      res.status(403).json({ message: 'Ungültiger Origin.' });
      return;
    }
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
    exposedHeaders: ['Retry-After'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

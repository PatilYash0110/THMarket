import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Shared by JwtStrategy (HTTP) and ChatGateway (WebSocket) so a revoked
// session — deleted account, or a token issued before a password change —
// is rejected the same way on both transports. Both sides of the iat
// comparison are truncated to whole seconds (JWT's own resolution), so a
// login in the same second as a password change isn't wrongly rejected.
export async function assertSessionStillValid(
  prisma: PrismaService,
  userId: string,
  issuedAt?: number,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordChangedAt: true },
  });

  if (!user) {
    throw new UnauthorizedException(
      'Sitzung abgelaufen. Bitte melde dich erneut an.',
    );
  }

  if (
    user.passwordChangedAt &&
    issuedAt &&
    issuedAt < Math.floor(user.passwordChangedAt.getTime() / 1000)
  ) {
    throw new UnauthorizedException(
      'Sitzung abgelaufen. Bitte melde dich erneut an.',
    );
  }
}

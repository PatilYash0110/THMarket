import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { AUTH_COOKIE_NAME } from '../auth/auth-cookie';
import type { JwtPayload } from '../auth/jwt.strategy';
import { assertSessionStillValid } from '../auth/session-validation';
import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from './chat.service';

const MAX_MESSAGE_LENGTH = 2000;
// Simple in-memory sliding window per connected socket — sockets aren't
// covered by the HTTP-only ThrottlerGuard used elsewhere in this app, and
// without any limit here a connected client could emit 'sendMessage' in as
// tight a loop as the network allows.
const MESSAGE_RATE_LIMIT = 10;
const MESSAGE_RATE_WINDOW_MS = 10_000;

function extractCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  const found = header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : undefined;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: process.env.CORS_ORIGIN?.split(',') ?? 'http://localhost:5173', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private readonly messageTimestamps = new Map<string, number[]>();

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly chatService: ChatService,
    private readonly prisma: PrismaService,
  ) {}

  // The JWT arrives either via the httpOnly auth cookie (same one the HTTP
  // API now uses — sent automatically by the browser on the handshake
  // request, since socket.io-client is configured with withCredentials) or,
  // as a fallback, the handshake's `auth` payload — sockets don't have
  // per-message headers, so this is verified once at connect time, same
  // secret as JwtStrategy's HTTP-side verification. Any failure just
  // disconnects; a rejected handshake is signal enough on its own.
  async handleConnection(client: Socket): Promise<void> {
    try {
      const cookieToken = extractCookie(client.handshake.headers.cookie, AUTH_COOKIE_NAME);
      const token = cookieToken ?? (client.handshake.auth?.token as string | undefined);
      if (!token) throw new Error('missing token');
      const payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });
      await assertSessionStillValid(this.prisma, payload.sub, payload.iat);
      client.data.userId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.messageTimestamps.delete(client.id);
  }

  @SubscribeMessage('joinConversation')
  async handleJoin(@ConnectedSocket() client: Socket, @MessageBody() conversationId: string): Promise<void> {
    const userId = client.data.userId as string | undefined;
    if (!userId || typeof conversationId !== 'string' || !(await this.chatService.isParticipant(userId, conversationId))) {
      return;
    }
    await client.join(`conversation:${conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { conversationId: string; text: string },
  ): Promise<void> {
    const userId = client.data.userId as string | undefined;
    if (!userId || !this.withinRateLimit(client.id)) {
      return;
    }
    const conversationId = body?.conversationId;
    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    if (
      typeof conversationId !== 'string' ||
      !text ||
      text.length > MAX_MESSAGE_LENGTH ||
      !(await this.chatService.isParticipant(userId, conversationId))
    ) {
      return;
    }
    const message = await this.chatService.createMessage(conversationId, userId, text);
    this.server.to(`conversation:${conversationId}`).emit('message', message);
  }

  private withinRateLimit(socketId: string): boolean {
    const now = Date.now();
    const timestamps = (this.messageTimestamps.get(socketId) ?? []).filter(
      (time) => now - time < MESSAGE_RATE_WINDOW_MS,
    );
    if (timestamps.length >= MESSAGE_RATE_LIMIT) {
      this.messageTimestamps.set(socketId, timestamps);
      return false;
    }
    timestamps.push(now);
    this.messageTimestamps.set(socketId, timestamps);
    return true;
  }
}

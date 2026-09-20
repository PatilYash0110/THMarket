import { forwardRef, Inject } from '@nestjs/common';
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

// Socket.io types `Socket.data` as `any` by default — this pins it to the
// two fields this gateway actually stores there, so every client.data.*
// access below is checked instead of silently `any`.
interface ChatSocketData {
  userId?: string;
  authenticated?: Promise<void>;
}
type ChatSocket = Socket<any, any, any, ChatSocketData>;

const MAX_MESSAGE_LENGTH = 2000;
// Simple in-memory sliding window per connected socket — sockets aren't
// covered by the HTTP-only ThrottlerGuard used elsewhere in this app, and
// without any limit here a connected client could emit 'sendMessage' in as
// tight a loop as the network allows.
const MESSAGE_RATE_LIMIT = 10;
const MESSAGE_RATE_WINDOW_MS = 10_000;

function extractCookie(
  header: string | undefined,
  name: string,
): string | undefined {
  if (!header) return undefined;
  const found = header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : undefined;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') ?? 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private readonly messageTimestamps = new Map<string, number[]>();

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @Inject(forwardRef(() => ChatService))
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
  //
  // Nest binds @SubscribeMessage handlers on this socket right after this
  // method is *called*, without waiting for the promise it returns to
  // settle — so a client that emits 'joinConversation' the instant it sees
  // 'connect' can reach handleJoin() before the two awaits below have run,
  // finding client.data.userId still unset and silently dropping the join.
  // Stashing the in-flight promise on client.data (synchronously, before
  // any await here) lets every other handler await it first and see the
  // fully-authenticated socket either way.
  handleConnection(client: ChatSocket): Promise<void> {
    const authenticated = this.authenticate(client);
    client.data.authenticated = authenticated;
    return authenticated;
  }

  private async authenticate(client: ChatSocket): Promise<void> {
    try {
      const cookieToken = extractCookie(
        client.handshake.headers.cookie,
        AUTH_COOKIE_NAME,
      );
      const token =
        cookieToken ?? (client.handshake.auth?.token as string | undefined);
      if (!token) throw new Error('missing token');
      const payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });
      await assertSessionStillValid(this.prisma, payload.sub, payload.iat);
      client.data.userId = payload.sub;
      // A per-user room, joined regardless of which conversation rooms get
      // joined afterward — lets notifyConversationStarted() below reach a
      // seller for a conversation that didn't exist yet at connect time,
      // which 'conversation:<id>' rooms alone can never cover.
      await client.join(`user:${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: ChatSocket): void {
    this.messageTimestamps.delete(client.id);
  }

  // Called by ChatService right after a brand-new conversation is created,
  // so the seller's first message from a buyer arrives live instead of
  // only showing up on their next full page load — the seller's socket has
  // no reason to have ever joined 'conversation:<id>' for a thread that
  // didn't exist yet when they connected.
  notifyConversationStarted(sellerId: string, conversation: unknown): void {
    this.server
      .to(`user:${sellerId}`)
      .emit('conversationStarted', conversation);
  }

  @SubscribeMessage('joinConversation')
  async handleJoin(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() conversationId: string,
  ): Promise<void> {
    await client.data.authenticated;
    const userId = client.data.userId;
    if (
      !userId ||
      typeof conversationId !== 'string' ||
      !(await this.chatService.isParticipant(userId, conversationId))
    ) {
      return;
    }
    await client.join(`conversation:${conversationId}`);
  }

  // Returns an ack result rather than firing and forgetting — a rejected
  // send (rate-limited, too long, not a participant) previously vanished
  // silently server-side while the client had already cleared its draft,
  // so the text was just gone with no way to know or retry (B-05). The
  // client passes an ack callback; when it does, NestJS's socket.io
  // adapter sends this return value back as that callback's argument.
  @SubscribeMessage('sendMessage')
  async handleSend(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() body: { conversationId: string; text: string },
  ): Promise<{ ok: boolean; reason?: string }> {
    await client.data.authenticated;
    const userId = client.data.userId;
    if (!userId) {
      return { ok: false, reason: 'unauthorized' };
    }
    if (!this.withinRateLimit(client.id)) {
      return { ok: false, reason: 'rate_limited' };
    }
    const conversationId = body?.conversationId;
    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    if (typeof conversationId !== 'string' || !text) {
      return { ok: false, reason: 'invalid' };
    }
    if (text.length > MAX_MESSAGE_LENGTH) {
      return { ok: false, reason: 'too_long' };
    }
    if (!(await this.chatService.isParticipant(userId, conversationId))) {
      return { ok: false, reason: 'forbidden' };
    }
    const message = await this.chatService.createMessage(
      conversationId,
      userId,
      text,
    );
    this.server.to(`conversation:${conversationId}`).emit('message', message);
    return { ok: true };
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

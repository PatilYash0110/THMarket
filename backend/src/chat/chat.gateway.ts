import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { JwtPayload } from '../auth/jwt.strategy';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: process.env.CORS_ORIGIN?.split(',') ?? 'http://localhost:5173' },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly chatService: ChatService,
  ) {}

  // The JWT arrives via the handshake's `auth` payload (socket.io-client's
  // `io(url, { auth: { token } })`), not an Authorization header — sockets
  // don't have per-message headers, so this is verified once at connect
  // time, same secret as JwtStrategy's HTTP-side verification. Any failure
  // just disconnects; a rejected handshake is signal enough on its own.
  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = client.handshake.auth?.token as string | undefined;
      if (!token) throw new Error('missing token');
      const payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });
      client.data.userId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('joinConversation')
  async handleJoin(@ConnectedSocket() client: Socket, @MessageBody() conversationId: string): Promise<void> {
    const userId = client.data.userId as string | undefined;
    if (!userId || !(await this.chatService.isParticipant(userId, conversationId))) {
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
    const text = body?.text?.trim();
    if (!userId || !text || !(await this.chatService.isParticipant(userId, body.conversationId))) {
      return;
    }
    const message = await this.chatService.createMessage(body.conversationId, userId, text);
    this.server.to(`conversation:${body.conversationId}`).emit('message', message);
  }
}

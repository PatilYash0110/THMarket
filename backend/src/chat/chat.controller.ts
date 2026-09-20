import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.strategy';
import { ChatService } from './chat.service';
import { StartConversationDto } from './dto/start-conversation.dto';

@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  startConversation(
    @CurrentUser() user: JwtPayload,
    @Body() dto: StartConversationDto,
  ) {
    return this.chatService.startConversation(user.sub, dto.listingId);
  }

  @Get()
  listConversations(@CurrentUser() user: JwtPayload) {
    return this.chatService.listConversations(user.sub);
  }

  @Get(':id/messages')
  getMessages(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.chatService.getMessages(user.sub, id);
  }

  // Called by the frontend when a thread is actually opened — separate from
  // getMessages() above so a component can re-mark a still-open thread read
  // (e.g. after a live socket message arrives while it's on screen) without
  // needing to refetch the whole message history again.
  @Post(':id/read')
  async markRead(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.chatService.markRead(user.sub, id);
    return { read: true };
  }
}

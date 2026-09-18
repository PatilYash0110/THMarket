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
  startConversation(@CurrentUser() user: JwtPayload, @Body() dto: StartConversationDto) {
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
}

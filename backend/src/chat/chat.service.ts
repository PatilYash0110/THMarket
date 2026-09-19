import { ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from './chat.gateway';

const USER_SELECT = { id: true, name: true } as const;
// Shared by startConversation() and listConversations() so both always
// return the same shape — messages is always present as an array (empty for
// a brand-new thread), never omitted, matching the frontend's Conversation
// type exactly.
const CONVERSATION_INCLUDE = {
  listing: { select: { id: true, title: true, status: true } },
  buyer: { select: USER_SELECT },
  seller: { select: USER_SELECT },
  messages: { take: 1, orderBy: { createdAt: 'desc' } },
} as const;

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ChatGateway)) private readonly chatGateway: ChatGateway,
  ) {}

  // Idempotent via a single atomic upsert on the (listingId, buyerId) unique
  // key, not a separate find-then-create — messaging the same seller about
  // the same listing twice reopens the same thread instead of forking a new
  // one, with no race window between the check and the write.
  async startConversation(buyerId: string, listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { sellerId: true },
    });
    if (!listing) {
      throw new NotFoundException('Inserat nicht gefunden.');
    }
    if (!listing.sellerId) {
      throw new ForbiddenException('Der Verkäufer dieses Inserats existiert nicht mehr.');
    }
    if (listing.sellerId === buyerId) {
      throw new ForbiddenException('Du kannst dir nicht selbst schreiben.');
    }

    const conversation = await this.prisma.conversation.upsert({
      where: { listingId_buyerId: { listingId, buyerId } },
      create: { listingId, buyerId, sellerId: listing.sellerId },
      update: {},
      include: CONVERSATION_INCLUDE,
    });
    const result = { ...conversation, unreadCount: await this.countUnread(conversation, buyerId) };
    // Reaches the seller even if this is a brand-new thread they've never
    // joined the room for — see ChatGateway.notifyConversationStarted().
    // Harmless to call on a reopened existing thread too: their socket
    // already has this conversation, so a repeat event just gets merged.
    this.chatGateway.notifyConversationStarted(listing.sellerId, result);
    return result;
  }

  // Newest-activity-first; only the single latest message per conversation
  // for a lightweight list-view preview, not the full history. Prisma can't
  // order by a related record's max field directly, so this fetches plainly
  // and re-sorts in JS by each conversation's latest message (or its own
  // createdAt if it has none yet) — same "sort in JS after the query" idiom
  // already used in AdminService.listReports().
  async listConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      include: CONVERSATION_INCLUDE,
    });
    const withUnread = await Promise.all(
      conversations.map(async (conversation) => ({
        ...conversation,
        unreadCount: await this.countUnread(conversation, userId),
      })),
    );
    const activityTime = (c: (typeof withUnread)[number]) =>
      (c.messages[0]?.createdAt ?? c.createdAt).getTime();
    return [...withUnread].sort((a, b) => activityTime(b) - activityTime(a));
  }

  // Messages sent by the OTHER party after MY own <side>LastReadAt — a null
  // LastReadAt (never opened this thread) counts every message from them.
  // `senderId: { not: userId }` also naturally excludes my own messages
  // from my own unread count without a separate check.
  private async countUnread(
    conversation: {
      id: string;
      buyerId: string | null;
      sellerId: string | null;
      buyerLastReadAt: Date | null;
      sellerLastReadAt: Date | null;
    },
    userId: string,
  ): Promise<number> {
    const lastReadAt = conversation.buyerId === userId ? conversation.buyerLastReadAt : conversation.sellerLastReadAt;
    return this.prisma.message.count({
      where: {
        conversationId: conversation.id,
        senderId: { not: userId },
        ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
      },
    });
  }

  // Called when a user actually opens a thread (GET messages, or the
  // frontend explicitly marking it read) — stamps that side's
  // <side>LastReadAt to now, which is what countUnread() above measures
  // against for every future listConversations() call.
  async markRead(userId: string, conversationId: string): Promise<void> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true },
    });
    if (!conversation) {
      throw new NotFoundException('Unterhaltung nicht gefunden.');
    }
    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new ForbiddenException('Du bist kein Teil dieser Unterhaltung.');
    }
    const field = conversation.buyerId === userId ? 'buyerLastReadAt' : 'sellerLastReadAt';
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { [field]: new Date() },
    });
  }

  async isParticipant(userId: string, conversationId: string): Promise<boolean> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true },
    });
    return conversation !== null && (conversation.buyerId === userId || conversation.sellerId === userId);
  }

  async getMessages(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) {
      throw new NotFoundException('Unterhaltung nicht gefunden.');
    }
    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new ForbiddenException('Du bist kein Teil dieser Unterhaltung.');
    }
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createMessage(conversationId: string, senderId: string, text: string) {
    return this.prisma.message.create({
      data: { conversationId, senderId, text },
      include: { sender: { select: USER_SELECT } },
    });
  }
}

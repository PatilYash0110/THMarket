import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const USER_SELECT = { id: true, name: true } as const;

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.conversation.upsert({
      where: { listingId_buyerId: { listingId, buyerId } },
      create: { listingId, buyerId, sellerId: listing.sellerId },
      update: {},
      include: {
        listing: { select: { id: true, title: true } },
        buyer: { select: USER_SELECT },
        seller: { select: USER_SELECT },
      },
    });
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
      include: {
        listing: { select: { id: true, title: true } },
        buyer: { select: USER_SELECT },
        seller: { select: USER_SELECT },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });
    const activityTime = (c: (typeof conversations)[number]) =>
      (c.messages[0]?.createdAt ?? c.createdAt).getTime();
    return [...conversations].sort((a, b) => activityTime(b) - activityTime(a));
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

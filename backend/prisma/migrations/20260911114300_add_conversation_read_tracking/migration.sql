-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "buyerLastReadAt" TIMESTAMP(3),
ADD COLUMN     "sellerLastReadAt" TIMESTAMP(3);

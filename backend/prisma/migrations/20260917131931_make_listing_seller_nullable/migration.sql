-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_sellerId_fkey";

-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "sellerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

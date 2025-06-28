-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "totalPrice" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "ownerEmail" TEXT,
ADD COLUMN     "ownerName" TEXT,
ADD COLUMN     "ownerPhone" TEXT,
ADD COLUMN     "ownerWhatsApp" TEXT;

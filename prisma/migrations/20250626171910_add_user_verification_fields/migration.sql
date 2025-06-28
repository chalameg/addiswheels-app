-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationDocument" TEXT,
ADD COLUMN     "verificationStatus" TEXT;

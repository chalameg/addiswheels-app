-- Add contact fields to User table
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "whatsapp" TEXT;

-- Add ownerId column to Vehicle table (nullable initially)
ALTER TABLE "Vehicle" ADD COLUMN "ownerId" INTEGER;

-- Create a default user for existing vehicles (you may want to update this with actual user IDs)
-- For now, we'll use the first user or create a default one
INSERT INTO "User" ("name", "email", "password", "role", "createdAt", "phone", "whatsapp")
SELECT 'Default Owner', 'default@addiswheels.com', '$2b$10$default', 'user', NOW(), NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM "User" LIMIT 1);

-- Update existing vehicles to have an owner (using the first user)
UPDATE "Vehicle" 
SET "ownerId" = (SELECT id FROM "User" LIMIT 1)
WHERE "ownerId" IS NULL;

-- Make ownerId required
ALTER TABLE "Vehicle" ALTER COLUMN "ownerId" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop the old owner columns
ALTER TABLE "Vehicle" DROP COLUMN "ownerName";
ALTER TABLE "Vehicle" DROP COLUMN "ownerPhone";
ALTER TABLE "Vehicle" DROP COLUMN "ownerEmail";
ALTER TABLE "Vehicle" DROP COLUMN "ownerWhatsApp"; 
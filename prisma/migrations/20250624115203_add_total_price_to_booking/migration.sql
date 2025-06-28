/*
  Warnings:

  - Added the required column `totalPrice` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Update existing bookings with calculated totalPrice
UPDATE "Booking" 
SET "totalPrice" = (
  SELECT v."pricePerDay" * (
    EXTRACT(EPOCH FROM ("Booking"."endDate" - "Booking"."startDate")) / 86400 + 1
  )
  FROM "Vehicle" v 
  WHERE v.id = "Booking"."vehicleId"
)
WHERE "totalPrice" = 0;

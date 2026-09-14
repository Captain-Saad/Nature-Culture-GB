/*
  Warnings:

  - The `hotelCategory` column on the `TripLead` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `transport` column on the `TripLead` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `category` on the `Hotel` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `category` on the `Package` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Hotel" DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Package" DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TripLead" DROP COLUMN "hotelCategory",
ADD COLUMN     "hotelCategory" TEXT,
DROP COLUMN "transport",
ADD COLUMN     "transport" TEXT;

-- DropEnum
DROP TYPE "HotelCategory";

-- DropEnum
DROP TYPE "PackageCategory";

-- DropEnum
DROP TYPE "Transport";

-- CreateIndex
CREATE INDEX "Hotel_category_idx" ON "Hotel"("category");

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('Skardu', 'Hunza', 'Gilgit', 'Astore', 'Ghizer', 'Nagar', 'Diamer', 'Ghanche', 'Shigar', 'Kharmang');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('Easy', 'Moderate', 'Challenging', 'Extreme');

-- CreateEnum
CREATE TYPE "HotelCategory" AS ENUM ('Budget', 'Mid-Range', 'Luxury');

-- CreateEnum
CREATE TYPE "PackageCategory" AS ENUM ('Adventure', 'Honeymoon', 'Family', 'Budget Backpacker', 'Luxury');

-- CreateEnum
CREATE TYPE "Transport" AS ENUM ('Shared', 'Private', '4x4 Jeep');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TripLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('NEW', 'READ');

-- CreateEnum
CREATE TYPE "SituationStatus" AS ENUM ('Open', 'Closed', 'Restricted');

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" "Region" NOT NULL,
    "images" TEXT[],
    "shortDescription" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL,
    "bestTimeToVisit" TEXT NOT NULL,
    "estimatedDurationDays" INTEGER NOT NULL,
    "estimatedDurationLabel" TEXT NOT NULL,
    "activities" TEXT[],
    "difficulty" "Difficulty" NOT NULL,
    "approxCostMinPKR" INTEGER NOT NULL,
    "approxCostMaxPKR" INTEGER NOT NULL,
    "nearbyHotelIds" TEXT[],
    "nearbyAttractionIds" TEXT[],
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hotel" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" "Region" NOT NULL,
    "images" TEXT[],
    "description" TEXT,
    "starRating" INTEGER NOT NULL,
    "category" "HotelCategory" NOT NULL,
    "estimatedPricePerNightPKR" INTEGER NOT NULL,
    "priceLastUpdated" TIMESTAMP(3) NOT NULL,
    "facilities" TEXT[],
    "roomTypes" JSONB NOT NULL,
    "cancellationPolicy" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mountain" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "heightMeters" INTEGER NOT NULL,
    "range" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "images" TEXT[],
    "description" TEXT NOT NULL,
    "firstAscent" TEXT,
    "bestSeason" TEXT,
    "worldRank" INTEGER NOT NULL,
    "nearestTown" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mountain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "PackageCategory" NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "images" TEXT[],
    "estimatedPriceMinPKR" INTEGER NOT NULL,
    "estimatedPriceMaxPKR" INTEGER NOT NULL,
    "priceLastUpdated" TIMESTAMP(3) NOT NULL,
    "highlights" TEXT[],
    "itinerary" JSONB NOT NULL,
    "included" TEXT[],
    "excluded" TEXT[],
    "regions" "Region"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "destinationId" TEXT,
    "hotelId" TEXT,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "photoUrl" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "startingCity" TEXT NOT NULL,
    "destinationIds" TEXT[],
    "days" INTEGER NOT NULL,
    "travelers" INTEGER NOT NULL,
    "budgetPKR" INTEGER,
    "hotelCategory" "HotelCategory",
    "transport" "Transport",
    "activities" TEXT[],
    "status" "TripLeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SituationReport" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "region" "Region" NOT NULL,
    "status" "SituationStatus" NOT NULL,
    "details" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SituationReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Destination_slug_key" ON "Destination"("slug");

-- CreateIndex
CREATE INDEX "Destination_region_idx" ON "Destination"("region");

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_slug_key" ON "Hotel"("slug");

-- CreateIndex
CREATE INDEX "Hotel_region_idx" ON "Hotel"("region");

-- CreateIndex
CREATE INDEX "Hotel_category_idx" ON "Hotel"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Mountain_slug_key" ON "Mountain"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Package_slug_key" ON "Package"("slug");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE INDEX "TripLead_status_idx" ON "TripLead"("status");

-- CreateIndex
CREATE INDEX "ContactMessage_status_idx" ON "ContactMessage"("status");

-- CreateIndex
CREATE INDEX "SituationReport_region_idx" ON "SituationReport"("region");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

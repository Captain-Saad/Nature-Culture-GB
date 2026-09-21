-- AlterTable: TripLead can now also be created by the cart checkout
-- flow, which doesn't collect the Plan-My-Trip wizard's fixed fields --
-- relax those to nullable and add the cart-checkout columns.
ALTER TABLE "TripLead"
  ALTER COLUMN "startingCity" DROP NOT NULL,
  ALTER COLUMN "days" DROP NOT NULL,
  ALTER COLUMN "travelers" DROP NOT NULL,
  ADD COLUMN "email" TEXT,
  ADD COLUMN "cartItems" JSONB,
  ADD COLUMN "preferredDates" TEXT,
  ADD COLUMN "notes" TEXT;

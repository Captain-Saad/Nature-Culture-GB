-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "heroHeadline" TEXT,
    "heroSubtext" TEXT,
    "aboutUsCopy" TEXT,
    "contactDisplayText" TEXT,
    "heroBackgroundImage" TEXT,
    "heroBackgroundVideo" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

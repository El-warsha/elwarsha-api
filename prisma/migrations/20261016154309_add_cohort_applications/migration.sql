-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('received', 'under_review', 'accepted', 'rejected', 'withdrawn');

-- CreateTable
CREATE TABLE "CohortApplication" (
    "id" UUID NOT NULL,
    "cohortSlug" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'received',
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "githubHandle" TEXT NOT NULL,
    "discordHandle" TEXT NOT NULL,
    "currentStatus" TEXT NOT NULL,
    "collegeMajor" TEXT NOT NULL,
    "programmingExperience" TEXT NOT NULL,
    "technologies" TEXT NOT NULL,
    "gitExperience" TEXT NOT NULL,
    "personalPageUrl" TEXT NOT NULL,
    "githubRepoUrl" TEXT NOT NULL,
    "aiUsage" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CohortApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CohortApplication_cohortSlug_idx" ON "CohortApplication"("cohortSlug");

-- CreateIndex
CREATE UNIQUE INDEX "CohortApplication_cohortSlug_email_key" ON "CohortApplication"("cohortSlug", "email");

-- CreateIndex
CREATE UNIQUE INDEX "CohortApplication_cohortSlug_githubHandle_key" ON "CohortApplication"("cohortSlug", "githubHandle");

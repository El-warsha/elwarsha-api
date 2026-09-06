-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('ar', 'en');
CREATE TYPE "ProductStatus" AS ENUM ('draft', 'active', 'archived');
CREATE TYPE "EngagementStatus" AS ENUM ('planned', 'active', 'completed');
CREATE TYPE "MembershipRole" AS ENUM ('participant', 'mentor', 'maintainer', 'admin');
CREATE TYPE "AssignmentStatus" AS ENUM ('draft', 'published', 'closed');
CREATE TYPE "SubmissionStatus" AS ENUM ('draft', 'submitted', 'in_review', 'eligible', 'merged', 'withdrawn');
CREATE TYPE "PullRequestState" AS ENUM ('open', 'closed', 'merged');
CREATE TYPE "ReviewState" AS ENUM ('approved', 'changes_requested', 'commented', 'dismissed');
CREATE TYPE "CheckConclusion" AS ENUM ('pending', 'success', 'failure', 'cancelled', 'skipped', 'timed_out', 'action_required');
CREATE TYPE "WebhookProcessingStatus" AS ENUM ('received', 'queued', 'processed', 'failed');
CREATE TYPE "JobType" AS ENUM ('process_github_webhook', 'reconcile_pull_requests');
CREATE TYPE "JobStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'ar',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExternalIdentity" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "providerSubject" TEXT NOT NULL,
    "githubUserId" BIGINT,
    CONSTRAINT "ExternalIdentity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductRepository" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "githubOwner" TEXT NOT NULL,
    "githubRepo" TEXT NOT NULL,
    "installationId" BIGINT NOT NULL,
    CONSTRAINT "ProductRepository_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Cohort" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startsOn" DATE NOT NULL,
    "endsOn" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Cohort_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CohortProductEngagement" (
    "id" UUID NOT NULL,
    "cohortId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "status" "EngagementStatus" NOT NULL DEFAULT 'planned',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CohortProductEngagement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Membership" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "engagementId" UUID NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Assignment" (
    "id" UUID NOT NULL,
    "engagementId" UUID NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Submission" (
    "id" UUID NOT NULL,
    "assignmentId" UUID NOT NULL,
    "authorUserId" UUID NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'draft',
    "prUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GithubPullRequest" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "githubPrId" BIGINT NOT NULL,
    "number" INTEGER NOT NULL,
    "state" "PullRequestState" NOT NULL,
    "approvalCount" INTEGER NOT NULL DEFAULT 0,
    "checksPassed" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GithubPullRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GithubReview" (
    "id" UUID NOT NULL,
    "pullRequestId" UUID NOT NULL,
    "githubReviewId" BIGINT NOT NULL,
    "reviewerGithubUserId" BIGINT NOT NULL,
    "state" "ReviewState" NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GithubReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GithubCheckRun" (
    "id" UUID NOT NULL,
    "pullRequestId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "conclusion" "CheckConclusion" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GithubCheckRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GithubWebhookDelivery" (
    "id" UUID NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "processingStatus" "WebhookProcessingStatus" NOT NULL DEFAULT 'received',
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GithubWebhookDelivery_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Job" (
    "id" UUID NOT NULL,
    "type" "JobType" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'pending',
    "payload" JSONB NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "webhookId" UUID,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "ExternalIdentity_provider_providerSubject_key" ON "ExternalIdentity"("provider", "providerSubject");
CREATE UNIQUE INDEX "ExternalIdentity_githubUserId_key" ON "ExternalIdentity"("githubUserId");
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE UNIQUE INDEX "ProductRepository_productId_key" ON "ProductRepository"("productId");
CREATE UNIQUE INDEX "ProductRepository_githubOwner_githubRepo_key" ON "ProductRepository"("githubOwner", "githubRepo");
CREATE UNIQUE INDEX "Cohort_slug_key" ON "Cohort"("slug");
CREATE UNIQUE INDEX "CohortProductEngagement_cohortId_productId_key" ON "CohortProductEngagement"("cohortId", "productId");
CREATE UNIQUE INDEX "Membership_userId_engagementId_key" ON "Membership"("userId", "engagementId");
CREATE UNIQUE INDEX "Assignment_engagementId_weekNumber_key" ON "Assignment"("engagementId", "weekNumber");
CREATE UNIQUE INDEX "Submission_assignmentId_authorUserId_key" ON "Submission"("assignmentId", "authorUserId");
CREATE UNIQUE INDEX "GithubPullRequest_submissionId_key" ON "GithubPullRequest"("submissionId");
CREATE UNIQUE INDEX "GithubPullRequest_githubPrId_key" ON "GithubPullRequest"("githubPrId");
CREATE UNIQUE INDEX "GithubReview_githubReviewId_key" ON "GithubReview"("githubReviewId");
CREATE UNIQUE INDEX "GithubCheckRun_pullRequestId_name_key" ON "GithubCheckRun"("pullRequestId", "name");
CREATE UNIQUE INDEX "GithubWebhookDelivery_deliveryId_key" ON "GithubWebhookDelivery"("deliveryId");

ALTER TABLE "ExternalIdentity" ADD CONSTRAINT "ExternalIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductRepository" ADD CONSTRAINT "ProductRepository_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CohortProductEngagement" ADD CONSTRAINT "CohortProductEngagement_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CohortProductEngagement" ADD CONSTRAINT "CohortProductEngagement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "CohortProductEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "CohortProductEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GithubPullRequest" ADD CONSTRAINT "GithubPullRequest_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GithubReview" ADD CONSTRAINT "GithubReview_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "GithubPullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GithubCheckRun" ADD CONSTRAINT "GithubCheckRun_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "GithubPullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "GithubWebhookDelivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

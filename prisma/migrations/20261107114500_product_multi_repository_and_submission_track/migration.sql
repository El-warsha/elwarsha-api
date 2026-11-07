-- DropIndex
DROP INDEX IF EXISTS "ProductRepository_productId_key";
DROP INDEX IF EXISTS "ProductRepository_productId_track_key";

-- DropIndex
DROP INDEX IF EXISTS "Submission_assignmentId_authorUserId_key";
DROP INDEX IF EXISTS "Submission_assignmentId_authorUserId_track_key";

-- AlterTable ProductRepository
ALTER TABLE "ProductRepository" DROP COLUMN IF EXISTS "track";

-- AlterTable Submission
ALTER TABLE "Submission" DROP COLUMN IF EXISTS "track";
ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "productRepositoryId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ProductRepository_productId_githubOwner_githubRepo_key" ON "ProductRepository"("productId", "githubOwner", "githubRepo");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Submission_assignmentId_authorUserId_productRepositoryId_key" ON "Submission"("assignmentId", "authorUserId", "productRepositoryId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Submission_productRepositoryId_fkey'
  ) THEN
    ALTER TABLE "Submission" ADD CONSTRAINT "Submission_productRepositoryId_fkey" FOREIGN KEY ("productRepositoryId") REFERENCES "ProductRepository"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

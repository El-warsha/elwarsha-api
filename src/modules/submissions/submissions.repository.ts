import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import type { SaveSubmissionInput } from "./submissions.types.js";

@Injectable()
export class SubmissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findGithubUserId(userId: string): Promise<bigint | null> {
    const identity = await this.prisma.externalIdentity.findFirst({
      where: { userId, githubUserId: { not: null } },
      select: { githubUserId: true },
    });
    return identity?.githubUserId ?? null;
  }

  async findEngagementId(userId: string, cohortSlug: string): Promise<string | null> {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        engagement: {
          cohort: { slug: cohortSlug },
        },
      },
      select: { engagementId: true },
    });
    if (membership) return membership.engagementId;

    const engagement = await this.prisma.cohortProductEngagement.findFirst({
      where: { cohort: { slug: cohortSlug } },
      select: { id: true },
    });
    return engagement?.id ?? null;
  }

  async findAssignment(
    engagementId: string,
    weekNumber: number,
  ): Promise<{ id: string; weekNumber: number } | null> {
    return this.prisma.assignment.findUnique({
      where: { engagementId_weekNumber: { engagementId, weekNumber } },
      select: { id: true, weekNumber: true },
    });
  }

  async listRepositories(
    engagementId: string,
  ): Promise<{ id: string; githubOwner: string; githubRepo: string }[]> {
    return this.prisma.productRepository.findMany({
      where: { product: { engagements: { some: { id: engagementId } } } },
      select: {
        id: true,
        githubOwner: true,
        githubRepo: true,
      },
      orderBy: { githubRepo: "asc" },
    });
  }

  async saveSubmission(
    input: SaveSubmissionInput,
  ): Promise<{ id: string; status: string; prUrl: string | null; updatedAt: Date }> {
    const {
      assignmentId,
      authorUserId,
      productRepositoryId,
      status,
      prUrl,
      pullRequest,
    } = input;

    return this.prisma.$transaction(async (tx) => {
      const submission = await tx.submission.upsert({
        where: {
          assignmentId_authorUserId_productRepositoryId: {
            assignmentId,
            authorUserId,
            productRepositoryId,
          },
        },
        create: { assignmentId, authorUserId, productRepositoryId, status, prUrl },
        update: { status, prUrl },
        select: { id: true, status: true, prUrl: true, updatedAt: true },
      });

      if (pullRequest) {
        const data = {
          githubPrId: BigInt(pullRequest.githubPrId),
          number: pullRequest.number,
          state: pullRequest.state,
        };
        await tx.githubPullRequest.upsert({
          where: { submissionId: submission.id },
          create: { submissionId: submission.id, ...data },
          update: data,
        });
      } else {
        await tx.githubPullRequest.deleteMany({
          where: { submissionId: submission.id },
        });
      }

      return submission;
    });
  }
}

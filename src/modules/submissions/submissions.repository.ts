import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import type { SubmissionStatus } from "./submissions.types.js";

export type SubmissionRepositoryRef = {
  id: string;
  githubOwner: string;
  githubRepo: string;
};

export type SubmissionAssignmentContext = {
  assignmentId: string;
  engagementId: string;
  weekNumber: number;
  repositories: SubmissionRepositoryRef[];
};

export type PullRequestSnapshot = {
  githubPrId: string;
  number: number;
  state: "open" | "closed" | "merged";
  approvalCount: number;
  checksPassed: boolean;
};

export type SubmissionSnapshotInput = {
  assignmentId: string;
  authorUserId: string;
  productRepositoryId: string;
  status: SubmissionStatus;
  prUrl: string | null;
  pullRequest: PullRequestSnapshot | null;
};

export type SubmissionSnapshot = {
  id: string;
  updatedAt: Date;
};

@Injectable()
export class SubmissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAssignmentContext(
    cohortSlug: string,
    weekNumber: number,
  ): Promise<SubmissionAssignmentContext | null> {
    const cohort = await this.prisma.cohort.findUnique({
      where: { slug: cohortSlug },
      include: {
        engagements: {
          include: {
            assignments: { where: { weekNumber } },
            product: { include: { repositories: true } },
          },
        },
      },
    });

    if (!cohort) {
      return null;
    }

    for (const engagement of cohort.engagements) {
      const assignment = engagement.assignments[0];
      if (!assignment) {
        continue;
      }

      return {
        assignmentId: assignment.id,
        engagementId: engagement.id,
        weekNumber: assignment.weekNumber,
        repositories: engagement.product.repositories.map((repository) => ({
          id: repository.id,
          githubOwner: repository.githubOwner,
          githubRepo: repository.githubRepo,
        })),
      };
    }

    return null;
  }

  async findGithubUserId(userId: string): Promise<bigint | null> {
    const identity = await this.prisma.externalIdentity.findFirst({
      where: {
        userId,
        githubUserId: { not: null },
      },
      orderBy: { id: "asc" },
    });

    return identity?.githubUserId ?? null;
  }

  async upsertSubmissionSnapshot(
    input: SubmissionSnapshotInput,
  ): Promise<SubmissionSnapshot> {
    const submission = await this.prisma.submission.upsert({
      where: {
        assignmentId_authorUserId_productRepositoryId: {
          assignmentId: input.assignmentId,
          authorUserId: input.authorUserId,
          productRepositoryId: input.productRepositoryId,
        },
      },
      create: {
        assignmentId: input.assignmentId,
        authorUserId: input.authorUserId,
        productRepositoryId: input.productRepositoryId,
        status: input.status,
        prUrl: input.prUrl,
      },
      update: {
        status: input.status,
        prUrl: input.prUrl,
      },
      select: { id: true, updatedAt: true },
    });

    if (!input.pullRequest) {
      // A stale snapshot must not survive when GitHub no longer reports a
      // matching PR for this week.
      await this.prisma.githubPullRequest.deleteMany({
        where: { submissionId: submission.id },
      });

      return submission;
    }

    const snapshot = input.pullRequest;

    await this.prisma.githubPullRequest.upsert({
      where: { submissionId: submission.id },
      create: {
        submissionId: submission.id,
        githubPrId: BigInt(snapshot.githubPrId),
        number: snapshot.number,
        state: snapshot.state,
        approvalCount: snapshot.approvalCount,
        checksPassed: snapshot.checksPassed,
      },
      update: {
        githubPrId: BigInt(snapshot.githubPrId),
        number: snapshot.number,
        state: snapshot.state,
        approvalCount: snapshot.approvalCount,
        checksPassed: snapshot.checksPassed,
      },
    });

    return submission;
  }
}

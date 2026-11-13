import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import { SubmissionStatus } from "./submissions.types.js";

@Injectable()
export class SubmissionsRepository {
    constructor(
      private readonly prisma:PrismaService     
    ){}

    async getGithubUserId(userId: string): Promise<bigint | null> {
        const identity = await this.prisma.externalIdentity.findFirst({
            where: {
                userId,
                githubUserId: { not: null },
            }
        });
        return identity?.githubUserId ?? null;
    }

    async getAssignmentWithRepositories(cohortSlug: string, weekNumber: number) {
      return this.prisma.assignment.findFirst({
        where: {
        weekNumber,
        engagement: {
            cohort: { slug: cohortSlug },
        },
        },
        include: {
        engagement: {
            include: {
            product: {
                include:
                 { repositories: true },
            },
            },
        },
        },
    });
    }

    async upsertSubmission(data: {
      assignmentId: string;
      userId: string;
      productRepositoryId: string;
      status: SubmissionStatus;
      prUrl: string | null;
      pullRequest?: {
        githubPrId: string;
        number: number;
        state: "open" | "closed" | "merged";
        updatedAt: string;
      } | null;
    }) {
      return this.prisma.submission.upsert({
        where: {
          assignmentId_authorUserId_productRepositoryId: {
            assignmentId: data.assignmentId,
            authorUserId: data.userId,
            productRepositoryId: data.productRepositoryId,
          },
        },
        create: {
          assignmentId: data.assignmentId,
          authorUserId: data.userId,
          productRepositoryId: data.productRepositoryId,
          status: data.status,
          prUrl: data.prUrl,
          pullRequest: data.pullRequest
            ? {
                create: {
                  githubPrId: BigInt(data.pullRequest.githubPrId),
                  number: data.pullRequest.number,
                  state: data.pullRequest.state,
                  updatedAt: new Date(data.pullRequest.updatedAt),
                },
              }
            : undefined,
        },
        update: {
          status: data.status,
          prUrl: data.prUrl,
          pullRequest: data.pullRequest
            ? {
                upsert: {
                  create: {
                    githubPrId: BigInt(data.pullRequest.githubPrId),
                    number: data.pullRequest.number,
                    state: data.pullRequest.state,
                    updatedAt: new Date(data.pullRequest.updatedAt),
                  },
                  update: {
                    githubPrId: BigInt(data.pullRequest.githubPrId),
                    number: data.pullRequest.number,
                    state: data.pullRequest.state,
                    updatedAt: new Date(data.pullRequest.updatedAt),
                  },
                },
              }
            : undefined,
        },
      });
    }
}
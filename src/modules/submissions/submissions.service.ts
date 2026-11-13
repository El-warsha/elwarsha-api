import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import type { GithubAppClient } from "../github/github.ports.js";
import { GITHUB_APP_CLIENT } from "../github/github.tokens.js";
import { NotFoundError } from "../../common/errors.js";
import type { ProductRepository } from "@prisma/client";
import { matchPrToWeek } from "../github/github-matcher.js";

@Injectable()
export class SubmissionsService {
    constructor(
        private readonly  prisma: PrismaService,
       @Inject(GITHUB_APP_CLIENT)
private readonly github: GithubAppClient

    ){
        
    }
 

async findAssignment(
  cohortSlug: string,
  weekNumber: number,
  userId: string,
) {
  const assignment = await this.prisma.assignment.findFirst({
    where: {
      weekNumber: weekNumber,

      engagement: {
        cohort: {
          slug: cohortSlug,
        },

        memberships: {
          some: {
            userId: userId,
          },
        },
      },
    },
//// assignment.engagement.product.repositories
    include: {
      engagement: {
        include: {
          product: {
            include: {
              repositories: true,
            },
          },
        },
      },
    },
  });

  if (!assignment) {
    throw new NotFoundError("Assignment not found");
  }

  return assignment;
}
async findGithubIdentity(userId: string){
  const identity= await this.prisma.externalIdentity.findFirst({
    where:{
        userId: userId,
        githubUserId:{
            not: null
        }
    }
  });
 if (!identity || identity.githubUserId === null) {
    throw new NotFoundError("GitHub identity not found");
  }
  return identity.githubUserId;
}

async syncRepositorySubmission(
  assignmentId: string,
  userId: string,
  githubUserId: bigint,
  repository: ProductRepository,
  weekNumber: number,
){
  console.log(
  "Fetching:",
  repository.githubOwner,
  repository.githubRepo,
);

    const pullRequests = await this.github.listRepositoryPullRequests
    (repository.githubOwner, repository.githubRepo);
const matchingPr = pullRequests.find(
  (pr) =>
    BigInt(pr.authorGithubUserId) === githubUserId &&
    matchPrToWeek(pr.title, weekNumber),
);
const status =
  matchingPr?.state === "merged"
    ? "merged"
    : matchingPr?.state === "open"
      ? "in_review"
      : "draft";
  const submission = await this.prisma.submission.upsert({
  where: {
    assignmentId_authorUserId_productRepositoryId: {
      assignmentId,
      authorUserId: userId,
      productRepositoryId: repository.id,
    },
  },
  create: {
    assignmentId,
    authorUserId: userId,
    productRepositoryId: repository.id,
    status,
    prUrl: matchingPr?.htmlUrl ?? null,
  },
  update: {
    status,
    prUrl: matchingPr?.htmlUrl ?? null,
  },
});
if (matchingPr) {
  await this.prisma.githubPullRequest.upsert({
    where: {
      submissionId: submission.id,
    },
    create: {
      submissionId: submission.id,
      githubPrId: BigInt(matchingPr.githubPrId),
      number: matchingPr.number,
      state: matchingPr.state,
    },
    update: {
      githubPrId: BigInt(matchingPr.githubPrId),
      number: matchingPr.number,
      state: matchingPr.state,
    },
  });
}
else {
  await this.prisma.githubPullRequest.deleteMany({
    where: {
      submissionId: submission.id,
    },
  });
}
return this.prisma.submission.findUnique({
  where: {
    id: submission.id,
  },
  include: {
    productRepository: true,
    pullRequest: true,
  },
});
}

async getAssignmentSubmissions(
  cohortSlug: string,
  weekNumber: number,
  userId: string,
) {
  const assignment = await this.findAssignment(
    cohortSlug,
    weekNumber,
    userId,
  );

  const githubUserId = await this.findGithubIdentity(userId);

  const submissions = [];

  for (const repository of assignment.engagement.product.repositories) {
    const submission = await this.syncRepositorySubmission(
      assignment.id,
      userId,
      githubUserId,
      repository,
      weekNumber,
    );

    submissions.push(submission);
  }

  return {
    assignmentId: assignment.id,
    weekNumber: assignment.weekNumber,
    submissions,
  };
}
}
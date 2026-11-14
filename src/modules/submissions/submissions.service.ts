import { Inject, Injectable } from "@nestjs/common";

import { NotFoundError } from "../../common/errors.js";
import { matchPrToWeek } from "../github/github-matcher.js";
import type {
  GithubAppClient,
  NormalizedPullRequestSummary,
} from "../github/github.ports.js";
import { SubmissionsRepository } from "./submissions.repository.js";
import type {
  AssignmentSubmissionsResponse,
  PullRequestSummary,
  RepositorySubmissionItem,
  SubmissionStatus,
} from "./submissions.types.js";

function matchesAuthor(
  pullRequest: NormalizedPullRequestSummary,
  githubUserId: bigint,
): boolean {
  try {
    return BigInt(pullRequest.authorGithubUserId) === githubUserId;
  } catch {
    return false;
  }
}

function selectPullRequest(
  pullRequests: NormalizedPullRequestSummary[],
  githubUserId: bigint,
  weekNumber: number,
): NormalizedPullRequestSummary | undefined {
  const matches = pullRequests.filter(
    (pullRequest) =>
      matchesAuthor(pullRequest, githubUserId) &&
      matchPrToWeek(pullRequest.title, weekNumber),
  );

  return (
    matches.find((pullRequest) => pullRequest.state === "merged") ??
    matches.find((pullRequest) => pullRequest.state === "open") ??
    matches[0]
  );
}

function toSubmissionStatus(
  pullRequest: NormalizedPullRequestSummary | undefined,
): SubmissionStatus {
  if (pullRequest?.state === "merged") {
    return "merged";
  }
  if (pullRequest?.state === "open") {
    return "in_review";
  }
  return "draft";
}

function toPullRequestSummary(
  pullRequest: NormalizedPullRequestSummary | undefined,
): PullRequestSummary | null {
  if (!pullRequest) {
    return null;
  }

  return {
    number: pullRequest.number,
    state: pullRequest.state,
    htmlUrl: pullRequest.htmlUrl,
  };
}

@Injectable()
export class SubmissionsService {
  constructor(
    @Inject("GithubAppClient") private readonly github: GithubAppClient,
    private readonly repository: SubmissionsRepository,
  ) {}

  async getAssignmentSubmissions(
    cohortSlug: string,
    weekNumber: number,
    userId: string,
  ): Promise<AssignmentSubmissionsResponse> {
    const context = await this.repository.findAssignmentContext(cohortSlug, weekNumber);

    if (!context) {
      throw new NotFoundError(
        `Assignment for week ${weekNumber} in cohort "${cohortSlug}" not found`,
      );
    }

    const githubUserId = await this.repository.findGithubUserId(userId);

    const submissions = await Promise.all(
      context.repositories.map(async (repository) => {
        const pullRequests = await this.github.listRepositoryPullRequests(
          repository.githubOwner,
          repository.githubRepo,
        );

        const matchingPullRequest =
          githubUserId === null
            ? undefined
            : selectPullRequest(pullRequests, githubUserId, weekNumber);

        const status = toSubmissionStatus(matchingPullRequest);
        const pullRequest = toPullRequestSummary(matchingPullRequest);
        const prUrl = matchingPullRequest?.htmlUrl ?? null;

        const snapshot = await this.repository.upsertSubmissionSnapshot({
          assignmentId: context.assignmentId,
          authorUserId: userId,
          productRepositoryId: repository.id,
          status,
          prUrl,
          pullRequest: matchingPullRequest
            ? {
                githubPrId: matchingPullRequest.githubPrId,
                number: matchingPullRequest.number,
                state: matchingPullRequest.state,
                approvalCount: 0,
                checksPassed: false,
              }
            : null,
        });

        const item: RepositorySubmissionItem = {
          id: snapshot.id,
          assignmentId: context.assignmentId,
          weekNumber,
          productRepositoryId: repository.id,
          githubOwner: repository.githubOwner,
          githubRepo: repository.githubRepo,
          status,
          prUrl,
          pullRequest,
          updatedAt: snapshot.updatedAt.toISOString(),
        };

        return item;
      }),
    );

    return {
      assignmentId: context.assignmentId,
      weekNumber,
      submissions,
    };
  }
}

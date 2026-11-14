import { Inject, Injectable } from "@nestjs/common";
import { NotFoundError } from "../../common/errors.js";
import { SubmissionsRepository } from "./submissions.repository.js";
import { type GithubAppClient } from "../github/github.ports.js";
import { matchPrToWeek } from "../github/github-matcher.js";
import type {
  AssignmentSubmissionsResponse,
  RepositorySubmissionItem,
  SubmissionStatus,
} from "./submissions.types.js";

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly repo: SubmissionsRepository,
    @Inject("GithubAppClient") private readonly github: GithubAppClient,
  ) {}

  async getSubmissions(
    userId: string,
    cohortSlug: string,
    weekNumber: number,
  ): Promise<AssignmentSubmissionsResponse> {
    const engagementId = await this.repo.findEngagementId(userId, cohortSlug);
    if (!engagementId) {
      throw new NotFoundError(`Cohort "${cohortSlug}" has no engagement.`);
    }

    const assignment = await this.repo.findAssignment(engagementId, weekNumber);
    if (!assignment) {
      throw new NotFoundError(`No assignment for week ${weekNumber}.`);
    }

    const githubUserId = await this.repo.findGithubUserId(userId);
    const repositories = await this.repo.listRepositories(engagementId);

    const submissions: RepositorySubmissionItem[] = await Promise.all(
      repositories.map(async (repo) => {
        const prs = githubUserId
          ? await this.github.listRepositoryPullRequests(
              repo.githubOwner,
              repo.githubRepo,
            )
          : [];

        const matchedPrs = prs.filter(
          (pr) =>
            pr.authorGithubUserId &&
            BigInt(pr.authorGithubUserId) === githubUserId &&
            pr.state !== "closed" &&
            matchPrToWeek(pr.title, weekNumber),
        );

        const pr = matchedPrs.find((p) => p.state === "merged") ?? matchedPrs[0] ?? null;
        const status: SubmissionStatus = !pr
          ? "draft"
          : pr.state === "merged"
            ? "merged"
            : "in_review";

        const pullRequest = pr
          ? {
              githubPrId: pr.githubPrId,
              number: pr.number,
              state: pr.state,
            }
          : null;

        const saved = await this.repo.saveSubmission({
          assignmentId: assignment.id,
          authorUserId: userId,
          productRepositoryId: repo.id,
          status,
          prUrl: pr?.htmlUrl ?? null,
          pullRequest,
        });

        return {
          id: saved.id,
          assignmentId: assignment.id,
          weekNumber: assignment.weekNumber,
          productRepositoryId: repo.id,
          githubOwner: repo.githubOwner,
          githubRepo: repo.githubRepo,
          status,
          prUrl: pr?.htmlUrl ?? null,
          pullRequest: pr
            ? {
                number: pr.number,
                state: pr.state,
                htmlUrl: pr.htmlUrl,
              }
            : null,
          updatedAt: saved.updatedAt.toISOString(),
        };
      }),
    );

    return {
      assignmentId: assignment.id,
      weekNumber: assignment.weekNumber,
      submissions,
    };
  }
}

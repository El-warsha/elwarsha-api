import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SubmissionsRepository } from './submissions.repository.js';
import type { GithubAppClient } from '../github/github.ports.js';
import { matchPrToWeek } from '../github/github-matcher.js';
import type { AssignmentSubmissionsResponse, RepositorySubmissionItem } from './submissions.types.js';


@Injectable()
export class SubmissionsService {
  constructor(
    private readonly repo: SubmissionsRepository,
     @Inject('GithubAppClient') private readonly githubClient: GithubAppClient,
  ) {}

  async getAssignmentSubmissions (
    userId: string,
    cohortSlug: string,
    weekNumber: number
    ): Promise<AssignmentSubmissionsResponse> {
    const githubUserId = await this.repo.getGithubUserId(userId);
    if (!githubUserId) {
      throw new BadRequestException('You must connect your github account to submit');
    }


    const assignment = await this.repo.getAssignmentWithRepositories(cohortSlug, weekNumber);
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    
    const submissions: RepositorySubmissionItem[] = [];
    for (const repo of assignment.engagement.product.repositories) {
      const prs = await this.githubClient.listRepositoryPullRequests(repo.githubOwner, repo.githubRepo);
      const matchingPr = prs.find((pr) => {
        const isAuthor = pr.authorGithubUserId && BigInt(pr.authorGithubUserId) === githubUserId;
        const isTargetWeek = matchPrToWeek(pr.title, weekNumber);

        return isAuthor && isTargetWeek;
      });
      const status = !matchingPr 
          ? 'draft' 
          : matchingPr.state === 'merged'
          ? 'merged'
          : 'in_review';

      const savedSubmission = await this.repo.upsertSubmission({
        assignmentId: assignment.id,
        userId,
        productRepositoryId: repo.id,
        status,
        prUrl: matchingPr?.htmlUrl ?? null,
        pullRequest: matchingPr
          ? {
              githubPrId: matchingPr.githubPrId,
              number: matchingPr.number,
              state: matchingPr.state,
              updatedAt: matchingPr.updatedAt,
            }
          : null,
      });
      submissions.push({
        id: savedSubmission.id,
        assignmentId: assignment.id,
        weekNumber,
        productRepositoryId: repo.id,
        githubOwner: repo.githubOwner,
        githubRepo: repo.githubRepo,
        status,
        prUrl: matchingPr?.htmlUrl ?? null,
        pullRequest: matchingPr
          ? {
              number: matchingPr.number,
              state: matchingPr.state,
              htmlUrl: matchingPr.htmlUrl,
            }
          : null,
        updatedAt: savedSubmission.updatedAt.toISOString(),
      });
    }

    return {
      assignmentId: assignment.id,
      weekNumber,
      submissions,
    };
  }
}

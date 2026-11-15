import { Injectable } from "@nestjs/common";
import type { GithubAppClient } from "../github/github.ports.js"; // ✅ استخدام import type هنا
import { matchPrToWeek } from "../github/github-matcher.js";

@Injectable()
export class SubmissionsService {
  constructor(private readonly githubClient: GithubAppClient) {}

  async getAssignmentSubmissions(
    cohortSlug: string,
    weekNumber: number,
    userSession: any,
  ) {
    const githubUserId = BigInt(
      userSession?.githubUserId || process.env.FAKE_USER_GITHUB_ID || "1001",
    );

    const repositories: Array<{ owner: string; repo: string }> = [
      { owner: "El-warsha", repo: "elwarsha-api" },
      { owner: "El-warsha", repo: "elwarsha-web" },
    ];

    const results = [];

    for (const repoInfo of repositories) {
      const prs = await this.githubClient.listRepositoryPullRequests(
        repoInfo.owner,
        repoInfo.repo,
      );

      const matchedPr = prs.find(
        (pr) => pr.authorGithubId === githubUserId && matchPrToWeek(pr.title, weekNumber),
      );

      let status = "draft";
      if (matchedPr) {
        if (matchedPr.mergedAt) {
          status = "merged";
        } else if (matchedPr.state === "open") {
          status = "in_review";
        }
      }

      results.push({
        repositoryName: repoInfo.repo,
        status,
        prUrl: matchedPr ? matchedPr.htmlUrl : null,
        prNumber: matchedPr ? matchedPr.number : null,
      });
    }

    return results;
  }
}

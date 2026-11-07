import type { AppEnv } from "../../config/env.js";
import { verifyGithubSignature } from "./github-webhook.verifier.js";
import type {
  GithubAppClient,
  NormalizedPullRequest,
  NormalizedPullRequestSummary,
} from "./github.ports.js";

export class FakeGithubAppClient implements GithubAppClient {
  private pullRequests: NormalizedPullRequestSummary[];

  constructor(private readonly env: AppEnv) {
    const authorId = this.env.FAKE_USER_GITHUB_ID || "1001";
    this.pullRequests = [
      {
        githubPrId: "6001",
        number: 42,
        title: "[week-06] implement github runtime sync",
        state: "open",
        authorGithubUserId: authorId,
        authorGithubLogin: "test-participant",
        htmlUrl: "https://github.com/El-warsha/elwarsha-api/pull/42",
        mergedAt: null,
        createdAt: "2026-11-07T10:00:00.000Z",
        updatedAt: "2026-11-07T10:30:00.000Z",
      },
      {
        githubPrId: "6002",
        number: 43,
        title: "[week-06] implement submission status card",
        state: "open",
        authorGithubUserId: authorId,
        htmlUrl: "https://github.com/El-warsha/elwarsha-web/pull/43",
        mergedAt: null,
        createdAt: "2026-11-07T10:05:00.000Z",
        updatedAt: "2026-11-07T10:35:00.000Z",
      },
      {
        githubPrId: "1001",
        number: 1,
        title: "[week-01] navigate codebase and open pr",
        state: "merged",
        authorGithubUserId: authorId,
        htmlUrl: "https://github.com/El-warsha/elwarsha-api/pull/1",
        mergedAt: "2026-10-05T12:00:00.000Z",
        createdAt: "2026-10-02T10:00:00.000Z",
        updatedAt: "2026-10-05T12:00:00.000Z",
      },
      {
        githubPrId: "9001",
        number: 99,
        title: "[week-06] other participant work",
        state: "open",
        authorGithubUserId: "2002",
        htmlUrl: "https://github.com/El-warsha/elwarsha-api/pull/99",
        mergedAt: null,
        createdAt: "2026-11-07T09:00:00.000Z",
        updatedAt: "2026-11-07T09:30:00.000Z",
      },
    ];
  }

  verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
    return verifyGithubSignature(this.env.GITHUB_WEBHOOK_SECRET, rawBody, signature);
  }

  async getInstallationToken(): Promise<string> {
    return "fake-installation-token";
  }

  async getPullRequest(
    _owner: string,
    _repo: string,
    number: number,
  ): Promise<NormalizedPullRequest> {
    const pr = this.pullRequests.find((p) => p.number === number);
    if (!pr) {
      return {
        githubPrId: `${number}`,
        number,
        state: "open",
        approvalCount: 0,
        checksPassed: true,
        htmlUrl: `https://github.com/elwarsha/product/pull/${number}`,
      };
    }
    return {
      githubPrId: pr.githubPrId,
      number: pr.number,
      state: pr.state,
      approvalCount: pr.state === "merged" ? 1 : 0,
      checksPassed: true,
      htmlUrl: pr.htmlUrl,
    };
  }

  async listRepositoryPullRequests(
    owner: string,
    repo: string,
  ): Promise<NormalizedPullRequestSummary[]> {
    const target = `${owner.toLowerCase()}/${repo.toLowerCase()}`;
    return this.pullRequests.filter((pr) => pr.htmlUrl.toLowerCase().includes(target));
  }

  setPullRequests(pullRequests: NormalizedPullRequestSummary[]): void {
    this.pullRequests = pullRequests;
  }
}

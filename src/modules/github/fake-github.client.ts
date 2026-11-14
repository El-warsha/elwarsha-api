import type { AppEnv } from "../../config/env.js";
import { verifyGithubSignature } from "./github-webhook.verifier.js";
import type {
  GithubAppClient,
  NormalizedPullRequest,
  NormalizedPullRequestSummary,
} from "./github.ports.js";

export class FakeGithubAppClient implements GithubAppClient {
  private pullRequests: NormalizedPullRequestSummary[] = [];

  constructor(private readonly env?: AppEnv) {}

  verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
    if (!this.env) return true;
    return verifyGithubSignature(this.env.GITHUB_WEBHOOK_SECRET, rawBody, signature);
  }

  async getInstallationToken(): Promise<string> {
    return "fake-installation-token";
  }

  async getPullRequest(): Promise<NormalizedPullRequest> {
    return {
      githubPrId: "1",
      number: 1,
      state: "open",
      approvalCount: 0,
      checksPassed: false,
      htmlUrl: "https://github.com/elwarsha/product/pull/1",
    };
  }

   setPullRequests(prs: NormalizedPullRequestSummary[]): void {
    this.pullRequests = prs;
  }

  async listRepositoryPullRequests(
    _owner: string,
    _repo: string,
  ): Promise<NormalizedPullRequestSummary[]> {
    return this.pullRequests;
  }
}
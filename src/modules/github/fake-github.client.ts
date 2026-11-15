import type { AppEnv } from "../../config/env.js";
import { verifyGithubSignature } from "./github-webhook.verifier.js";
import type { GithubAppClient, NormalizedPullRequest } from "./github.ports.js";

export class FakeGithubAppClient implements GithubAppClient {
  constructor(private readonly env: AppEnv) {}

  verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
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

  async listRepositoryPullRequests(_owner: string, _repo: string): Promise<any[]> {
    // إرجاع مصفوفة وهمية للـ PRs لتناسب اختبارات الـ Fake Client
    return [
      {
        id: "1",
        number: 42,
        title: "[week-06] test pull request",
        state: "open",
        mergedAt: null,
        htmlUrl: "https://github.com/El-warsha/elwarsha-api/pull/42",
        authorGithubId: BigInt(process.env.FAKE_USER_GITHUB_ID || "1001"),
      },
    ];
  }
}

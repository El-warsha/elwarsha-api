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
}

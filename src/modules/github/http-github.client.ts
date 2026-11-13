import type { AppEnv } from "../../config/env.js";
import { verifyGithubSignature } from "./github-webhook.verifier.js";
import type {
  GithubAppClient,
  NormalizedPullRequest,
  NormalizedPullRequestSummary,
} from "./github.ports.js";

export interface RawGithubPullRequest {
  id: number;
  number: number;
  title: string;
  state:  "open" | "closed";
  user: {
    id: number;
    login: string;
  };
  html_url: string;
  merged_at: string | null;
  created_at: string;
  updated_at: string;
}

export class HttpGithubAppClient implements GithubAppClient {
  constructor(private readonly env: AppEnv) {}

  verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
    return verifyGithubSignature(this.env.GITHUB_WEBHOOK_SECRET, rawBody, signature);
  }

  async getInstallationToken(_installationId: string): Promise<string> {
    return "";
  }

  async getPullRequest(
    _owner: string,
    _repo: string,
    _number: number,
  ): Promise<NormalizedPullRequest> {
    throw new Error("Method not implemented.");
  }

  async listRepositoryPullRequests(
    owner: string,
    repo: string,
  ): Promise<NormalizedPullRequestSummary[]> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "ElWarsha-App",
    };

    if (this.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${this.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100`,
      { headers },
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const pulls = (await response.json()) as RawGithubPullRequest[];

    return pulls.map((pr) => ({
      githubPrId: String(pr.id),
      number: pr.number,
      title: pr.title,
      state: pr.merged_at ? "merged" : pr.state,
      authorGithubUserId: String(pr.user?.id),
      authorGithubLogin: pr.user?.login,
      htmlUrl: pr.html_url,
      mergedAt: pr.merged_at ?? null,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
    }));
  }
}
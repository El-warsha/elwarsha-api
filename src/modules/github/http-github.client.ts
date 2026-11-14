import type { AppEnv } from "../../config/env.js";
import { verifyGithubSignature } from "./github-webhook.verifier.js";
import type {
  GithubAppClient,
  NormalizedPullRequest,
  NormalizedPullRequestSummary,
} from "./github.ports.js";

interface GithubRawPullRequest {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  html_url: string;
  merged_at: string | null;
  created_at: string;
  updated_at: string;
  user: { id: number; login: string } | null;
  head: { sha: string; ref: string };
}

export class HttpGithubAppClient implements GithubAppClient {
  constructor(private readonly env: AppEnv) {}

  verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
    return verifyGithubSignature(this.env.GITHUB_WEBHOOK_SECRET, rawBody, signature);
  }

  async getInstallationToken(): Promise<string> {
    return "fake-installation-token";
  }

  async getPullRequest(
    owner: string,
    repo: string,
    number: number,
  ): Promise<NormalizedPullRequest> {
    return this.fetchPullRequest(this.repoUrl(owner, repo), number);
  }

  async listRepositoryPullRequests(
    owner: string,
    repo: string,
  ): Promise<NormalizedPullRequestSummary[]> {
    return this.fetchPullRequests(this.repoUrl(owner, repo));
  }

  // ** Private helper methods  ** //

  private repoUrl(owner: string, repo: string): string {
    return `https://api.github.com/repos/${owner.toLowerCase()}/${repo.toLowerCase()}`;
  }

  private coreHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "user-agent": "ElWarsha-App",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (this.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${this.env.GITHUB_TOKEN}`;
    }
    return headers;
  }

  private async getJson<T>(url: string): Promise<T> {
    const response = await fetch(url, { headers: this.coreHeaders() });
    if (!response.ok) {
      throw new Error(`GitHub API request failed with status ${response.status}`);
    }
    return (await response.json()) as T;
  }

  private async fetchPullRequests(
    baseUrl: string,
  ): Promise<NormalizedPullRequestSummary[]> {
    const prs = await this.getJson<GithubRawPullRequest[]>(
      `${baseUrl}/pulls?state=all&per_page=100`,
    );
    return prs.map((pr): NormalizedPullRequestSummary => ({
      githubPrId: String(pr.id),
      number: pr.number,
      title: pr.title,
      state: pr.merged_at ? "merged" : pr.state,
      authorGithubUserId: String(pr.user?.id ?? ""),
      authorGithubLogin: pr.user?.login,
      htmlUrl: pr.html_url,
      mergedAt: pr.merged_at,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
    }));
  }

  private async fetchPullRequest(
    baseUrl: string,
    number: number,
  ): Promise<NormalizedPullRequest> {
    const pr = await this.getJson<GithubRawPullRequest>(`${baseUrl}/pulls/${number}`);
    return {
      githubPrId: String(pr.id),
      number: pr.number,
      state: pr.merged_at ? "merged" : pr.state,
      htmlUrl: pr.html_url,
      // TODO
      approvalCount: 0,
      checksPassed: false,
    };
  }
}

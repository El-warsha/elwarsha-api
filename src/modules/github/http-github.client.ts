import type { AppEnv } from "../../config/env.js";
import { verifyGithubSignature } from "./github-webhook.verifier.js";
import type {
  GithubAppClient,
  NormalizedPullRequest,
  NormalizedPullRequestSummary,
} from "./github.ports.js";

const GITHUB_API_BASE_URL = "https://api.github.com";

type GithubPullRequestItem = {
  id: number;
  number: number;
  title: string;
  state: string;
  merged_at: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    login: string;
  } | null;
};

export class GithubApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly rateLimitReset: string | null = null,
  ) {
    super(message);
    this.name = "GithubApiError";
  }
}

function normalizeState(item: GithubPullRequestItem): "open" | "closed" | "merged" {
  if (item.merged_at) {
    return "merged";
  }
  return item.state === "open" ? "open" : "closed";
}

function normalizePullRequestSummary(
  item: GithubPullRequestItem,
): NormalizedPullRequestSummary {
  return {
    githubPrId: String(item.id),
    number: item.number,
    title: item.title,
    state: normalizeState(item),
    authorGithubUserId: item.user ? String(item.user.id) : "",
    ...(item.user?.login ? { authorGithubLogin: item.user.login } : {}),
    htmlUrl: item.html_url,
    mergedAt: item.merged_at,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

export class HttpGithubAppClient implements GithubAppClient {
  constructor(
    private readonly env: AppEnv,
    private readonly fetchImpl?: typeof fetch,
  ) {}

  verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
    return verifyGithubSignature(this.env.GITHUB_WEBHOOK_SECRET, rawBody, signature);
  }

  async getInstallationToken(_installationId: string): Promise<string> {
    return this.env.GITHUB_TOKEN;
  }

  async getPullRequest(
    owner: string,
    repo: string,
    number: number,
  ): Promise<NormalizedPullRequest> {
    const item = await this.request<GithubPullRequestItem>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${number}`,
    );
    const summary = normalizePullRequestSummary(item);

    return {
      githubPrId: summary.githubPrId,
      number: summary.number,
      state: summary.state,
      approvalCount: 0,
      checksPassed: false,
      htmlUrl: summary.htmlUrl,
    };
  }

  async listRepositoryPullRequests(
    owner: string,
    repo: string,
  ): Promise<NormalizedPullRequestSummary[]> {
    const items = await this.request<GithubPullRequestItem[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?state=all&per_page=100`,
    );

    return items.map(normalizePullRequestSummary);
  }

  private async request<T>(path: string): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "ElWarsha-App",
    };

    if (this.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${this.env.GITHUB_TOKEN}`;
    }

    const fetchFn = this.fetchImpl ?? globalThis.fetch;
    const response = await fetchFn(`${GITHUB_API_BASE_URL}${path}`, { headers });

    if (!response.ok) {
      const rateLimitRemaining = response.headers?.get?.("x-ratelimit-remaining");
      const rateLimitReset = response.headers?.get?.("x-ratelimit-reset") ?? null;
      const rateLimited =
        (response.status === 403 || response.status === 429) &&
        rateLimitRemaining === "0";
      const suffix = rateLimited ? " (GitHub rate limit exceeded)" : "";

      throw new GithubApiError(
        response.status,
        `GitHub API request failed with status ${response.status}${suffix}`,
        rateLimitReset,
      );
    }

    return (await response.json()) as T;
  }
}

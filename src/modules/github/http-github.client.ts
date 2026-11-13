
import type { AppEnv } from "../../config/env.js";
import { verifyGithubSignature } from "./github-webhook.verifier.js";
import type {
  GithubAppClient,
  NormalizedPullRequest,
  NormalizedPullRequestSummary,
} from "./github.ports.js";
import { createJwt } from "./github-jwt.js";

export class HttpGithubAppClient implements GithubAppClient {
  constructor(private readonly env: AppEnv) {}

  verifyWebhookSignature(
    rawBody: string,
    signature: string | undefined,
  ): boolean {
    return verifyGithubSignature(
      this.env.GITHUB_WEBHOOK_SECRET,
      rawBody,
      signature,
    );
  }

  async getInstallationToken(installationId: string): Promise<string> {
    if (!this.env.GITHUB_APP_ID || !this.env.GITHUB_APP_PRIVATE_KEY) {
      throw new Error("GitHub App credentials are missing");
    }

    const jwt = createJwt(
      this.env.GITHUB_APP_ID,
      this.env.GITHUB_APP_PRIVATE_KEY,
    );

    const url = `https://api.github.com/app/installations/${installationId}/access_tokens`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    return data.token;
  }

  async getPullRequest(
    owner: string,
    repo: string,
    number: number,
  ): Promise<NormalizedPullRequest> {
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "ElWarsha-App",
        ...(this.env.GITHUB_TOKEN && {
          Authorization: `Bearer ${this.env.GITHUB_TOKEN}`,
        }),
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      id: number;
      number: number;
      state: "open" | "closed";
      html_url: string;
      merged_at: string | null;
    };

    return {
      githubPrId: String(data.id),
      number: data.number,
      state: data.merged_at ? "merged" : data.state,
      approvalCount: 0,
      checksPassed: false,
      htmlUrl: data.html_url,
    };
  }

  async listRepositoryPullRequests(
    owner: string,
    repo: string,
  ): Promise<NormalizedPullRequestSummary[]> {
   
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "ElWarsha-App",
        ...(this.env.GITHUB_TOKEN && {
          Authorization: `Bearer ${this.env.GITHUB_TOKEN}`,
        }),
      },
    });
    console.log(response);
    if (!response.ok) {
        const remaining= response.headers.get("X-RateLimit-Remaining");
        const reset= response.headers.get("X-RateLimit-Reset");
        const retryAfter= response.headers.get("Retry-After");
        const isRateLimitStatus= response.status === 403 || response.status === 429;
        if (isRateLimitStatus) {
            if( remaining==='0')
                 throw new Error(
        `GitHub primary rate limit exceeded. Retry after timestamp: ${reset}.`,
      );
        const errorBody = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
        const isSecondaryRateLimit =
  errorBody?.message
    ?.toLowerCase()
    .includes("secondary rate limit") || retryAfter !== null;
        
        if (isSecondaryRateLimit) {
  throw new Error(
    `GitHub secondary rate limit exceeded. Retry after ${
      retryAfter ?? "at least 60"
    } seconds.`,
  );
}}
      throw new Error(`GitHub API error: ${response.status}`);
    }
  const data = (await response.json()) as {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  user: {
    id: number;
    login: string;
  };
  html_url: string;
  merged_at: string | null;
  created_at: string;
  updated_at: string;
}[];
return data.map((pr) => ({
  githubPrId: String(pr.id),
  number: pr.number,
  title: pr.title,
  state: pr.merged_at ? "merged" : pr.state,
  authorGithubUserId: String(pr.user.id),
  authorGithubLogin: pr.user.login,
  htmlUrl: pr.html_url,
  mergedAt: pr.merged_at,
  createdAt: pr.created_at,
  updatedAt: pr.updated_at,
}));

  }
}

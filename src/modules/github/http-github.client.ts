import type {
  GithubAppClient,
  NormalizedPullRequest,
  NormalizedPullRequestSummary,
} from "./github.ports.js";

interface RawGithubPr {
  number: number;
  title: string;
  state: "open" | "closed";
  merged_at: string | null;
  html_url: string;
  user: { id: number } | null;
}

export class HttpGithubAppClient implements GithubAppClient {
  constructor(private readonly token?: string) {}

  verifyWebhookSignature(_rawBody: string, _signature: string | undefined): boolean {
    throw new Error("Method not implemented.");
  }

  async getInstallationToken(_installationId: string): Promise<string> {
    throw new Error("Method not implemented.");
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
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100`,
      { headers },
    );
    if (!res.ok) {
      throw new Error(`GitHub request failed with status ${res.status}`);
    }
    const items = (await res.json()) as RawGithubPr[];
    return items.map((pr) => ({
      number: pr.number,
      title: pr.title,
      state: pr.merged_at ? "merged" : pr.state,
      htmlUrl: pr.html_url,
      authorGithubUserId: pr.user ? String(pr.user.id) : "",
    }));
  }
}

export type NormalizedPullRequest = {
  githubPrId: string;
  number: number;
  state: "open" | "closed" | "merged";
  approvalCount: number;
  checksPassed: boolean;
  htmlUrl: string;
};

export type NormalizedPullRequestSummary = {
  githubPrId: string;
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  authorGithubUserId: string;
  authorGithubLogin?: string;
  htmlUrl: string;
  mergedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export interface GithubAppClient {
  verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean;
  getInstallationToken(installationId: string): Promise<string>;
  getPullRequest(
    owner: string,
    repo: string,
    number: number,
  ): Promise<NormalizedPullRequest>;
  listRepositoryPullRequests(
    owner: string,
    repo: string,
  ): Promise<NormalizedPullRequestSummary[]>;
}

export type NormalizedPullRequest = {
  githubPrId: string;
  number: number;
  state: "open" | "closed" | "merged";
  approvalCount: number;
  checksPassed: boolean;
  htmlUrl: string;
};

<<<<<<< HEAD
export interface NormalizedPullRequestSummary {
  id: string;
  number: number;
  title: string;
  state: "open" | "closed";
  mergedAt: string | null;
  htmlUrl: string;
  authorGithubId: bigint;
}
=======
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
>>>>>>> upstream/main

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

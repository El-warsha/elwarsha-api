export type NormalizedPullRequest = {
  githubPrId: string;
  number: number;
  state: "open" | "closed" | "merged";
  approvalCount: number;
  checksPassed: boolean;
  htmlUrl: string;
};
//added by razan
export type NormalizedPullRequestSummary = {
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  htmlUrl: string;
  authorGithubUserId: string;
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

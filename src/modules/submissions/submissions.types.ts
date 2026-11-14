export type SubmissionStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "eligible"
  | "merged"
  | "withdrawn";
export type PullRequestSummary = {
  number: number;
  state: "open" | "closed" | "merged";
  htmlUrl: string;
};

export type RepositorySubmissionItem = {
  id: string | null;
  assignmentId: string;
  weekNumber: number;
  productRepositoryId?: string | null;
  githubOwner: string;
  githubRepo: string;
  status: SubmissionStatus;
  prUrl: string | null;
  pullRequest: PullRequestSummary | null;
  updatedAt: string | null;
};

export type AssignmentSubmissionsResponse = {
  assignmentId: string;
  weekNumber: number;
  submissions: RepositorySubmissionItem[];
};

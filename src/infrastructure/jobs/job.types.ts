export type JobType = "process_github_webhook" | "reconcile_pull_requests";

export type JobRecord = {
  id: string;
  type: JobType;
  payload: Record<string, unknown>;
  attemptCount: number;
};

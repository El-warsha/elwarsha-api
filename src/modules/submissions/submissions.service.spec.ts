import { beforeEach, describe, expect, it, vi } from "vitest";

import { NotFoundError } from "../../common/errors.js";
import type {
  GithubAppClient,
  NormalizedPullRequestSummary,
} from "../github/github.ports.js";
import type {
  SubmissionAssignmentContext,
  SubmissionSnapshotInput,
  SubmissionsRepository,
} from "./submissions.repository.js";
import { SubmissionsService } from "./submissions.service.js";

function pullRequest(
  overrides: Partial<NormalizedPullRequestSummary> = {},
): NormalizedPullRequestSummary {
  return {
    githubPrId: "6001",
    number: 42,
    title: "[week-06] implement github runtime sync",
    state: "open",
    authorGithubUserId: "1001",
    authorGithubLogin: "test-participant",
    htmlUrl: "https://github.com/El-warsha/elwarsha-api/pull/42",
    mergedAt: null,
    createdAt: "2026-11-07T10:00:00.000Z",
    updatedAt: "2026-11-07T10:30:00.000Z",
    ...overrides,
  };
}

describe("SubmissionsService", () => {
  let service: SubmissionsService;
  let githubMock: {
    listRepositoryPullRequests: ReturnType<typeof vi.fn>;
  };
  let repositoryMock: {
    findAssignmentContext: ReturnType<typeof vi.fn>;
    findGithubUserId: ReturnType<typeof vi.fn>;
    upsertSubmissionSnapshot: ReturnType<typeof vi.fn>;
  };

  const context: SubmissionAssignmentContext = {
    assignmentId: "assignment-6",
    engagementId: "engagement-1",
    weekNumber: 6,
    repositories: [
      {
        id: "repo-api",
        githubOwner: "El-warsha",
        githubRepo: "elwarsha-api",
      },
      {
        id: "repo-web",
        githubOwner: "El-warsha",
        githubRepo: "elwarsha-web",
      },
    ],
  };

  beforeEach(() => {
    githubMock = {
      listRepositoryPullRequests: vi.fn(),
    };
    repositoryMock = {
      findAssignmentContext: vi.fn().mockResolvedValue(context),
      findGithubUserId: vi.fn().mockResolvedValue(BigInt(1001)),
      upsertSubmissionSnapshot: vi
        .fn()
        .mockImplementation((input: SubmissionSnapshotInput) =>
          Promise.resolve({
            id: `submission-${input.productRepositoryId}`,
            updatedAt: new Date("2026-11-07T11:00:00.000Z"),
          }),
        ),
    };

    service = new SubmissionsService(
      githubMock as unknown as GithubAppClient,
      repositoryMock as unknown as SubmissionsRepository,
    );
  });

  it("returns an in-review submission for an open matching PR", async () => {
    githubMock.listRepositoryPullRequests.mockImplementation(
      (owner: string, repo: string) =>
        Promise.resolve(
          repo === "elwarsha-api"
            ? [pullRequest()]
            : [
                pullRequest({
                  githubPrId: "6002",
                  number: 43,
                  htmlUrl: "https://github.com/El-warsha/elwarsha-web/pull/43",
                }),
              ],
        ),
    );

    const result = await service.getAssignmentSubmissions("cohort-01", 6, "user-1");

    expect(result.assignmentId).toBe("assignment-6");
    expect(result.weekNumber).toBe(6);
    expect(result.submissions).toHaveLength(2);
    expect(result.submissions[0]).toMatchObject({
      id: "submission-repo-api",
      assignmentId: "assignment-6",
      weekNumber: 6,
      productRepositoryId: "repo-api",
      githubOwner: "El-warsha",
      githubRepo: "elwarsha-api",
      status: "in_review",
      prUrl: "https://github.com/El-warsha/elwarsha-api/pull/42",
      pullRequest: {
        number: 42,
        state: "open",
        htmlUrl: "https://github.com/El-warsha/elwarsha-api/pull/42",
      },
      updatedAt: "2026-11-07T11:00:00.000Z",
    });
  });

  it("returns merged when the matching PR was merged", async () => {
    githubMock.listRepositoryPullRequests.mockResolvedValue([
      pullRequest({
        state: "merged",
        mergedAt: "2026-11-08T09:00:00.000Z",
      }),
    ]);

    const result = await service.getAssignmentSubmissions("cohort-01", 6, "user-1");

    expect(result.submissions[0].status).toBe("merged");
    expect(result.submissions[0].pullRequest?.state).toBe("merged");
  });

  it("prefers a merged PR when both merged and open PRs match", async () => {
    githubMock.listRepositoryPullRequests.mockResolvedValue([
      pullRequest({ githubPrId: "6002", number: 43 }),
      pullRequest({
        githubPrId: "6003",
        number: 44,
        state: "merged",
        mergedAt: "2026-11-08T09:00:00.000Z",
      }),
    ]);

    const result = await service.getAssignmentSubmissions("cohort-01", 6, "user-1");

    expect(result.submissions[0].status).toBe("merged");
    expect(result.submissions[0].pullRequest?.number).toBe(44);
  });

  it("returns a draft with no PR snapshot when no matching PR exists", async () => {
    githubMock.listRepositoryPullRequests.mockResolvedValue([
      pullRequest({ title: "[week-05] previous week" }),
      pullRequest({ authorGithubUserId: "2002", number: 99 }),
    ]);

    const result = await service.getAssignmentSubmissions("cohort-01", 6, "user-1");

    for (const submission of result.submissions) {
      expect(submission.status).toBe("draft");
      expect(submission.prUrl).toBeNull();
      expect(submission.pullRequest).toBeNull();
    }

    const snapshotInput = repositoryMock.upsertSubmissionSnapshot.mock
      .calls[0][0] as SubmissionSnapshotInput;
    expect(snapshotInput.pullRequest).toBeNull();
    expect(snapshotInput.prUrl).toBeNull();
  });

  it("returns draft for every repository when the user has no GitHub identity", async () => {
    repositoryMock.findGithubUserId.mockResolvedValue(null);
    githubMock.listRepositoryPullRequests.mockResolvedValue([pullRequest()]);

    const result = await service.getAssignmentSubmissions("cohort-01", 6, "user-1");

    expect(result.submissions.map((submission) => submission.status)).toEqual([
      "draft",
      "draft",
    ]);
  });

  it("ignores PRs whose author id is not numeric", async () => {
    githubMock.listRepositoryPullRequests.mockResolvedValue([
      pullRequest({ authorGithubUserId: "not-a-number" }),
    ]);

    const result = await service.getAssignmentSubmissions("cohort-01", 6, "user-1");

    expect(result.submissions[0].status).toBe("draft");
  });

  it("queries every configured repository with its owner and repo", async () => {
    githubMock.listRepositoryPullRequests.mockResolvedValue([]);

    await service.getAssignmentSubmissions("cohort-01", 6, "user-1");

    expect(githubMock.listRepositoryPullRequests).toHaveBeenCalledTimes(2);
    expect(githubMock.listRepositoryPullRequests).toHaveBeenCalledWith(
      "El-warsha",
      "elwarsha-api",
    );
    expect(githubMock.listRepositoryPullRequests).toHaveBeenCalledWith(
      "El-warsha",
      "elwarsha-web",
    );
  });

  it("throws NotFoundError when the cohort or assignment does not exist", async () => {
    repositoryMock.findAssignmentContext.mockResolvedValue(null);

    await expect(
      service.getAssignmentSubmissions("missing", 6, "user-1"),
    ).rejects.toThrow(NotFoundError);
  });
});

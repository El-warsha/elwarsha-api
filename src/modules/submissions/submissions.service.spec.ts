import { beforeEach, describe, expect, it, vi } from "vitest";

import { NotFoundError } from "../../common/errors.js";
import type { NormalizedPullRequestSummary } from "../github/github.ports.js";
import { SubmissionsService } from "./submissions.service.js";

const USER_ID = "user-1";
const GITHUB_ID = 999n;
const SAVED_AT = new Date("2026-11-10T10:00:00.000Z");

const pr = (
  overrides: Partial<NormalizedPullRequestSummary> = {},
): NormalizedPullRequestSummary => ({
  githubPrId: "5001",
  number: 42,
  title: "[week-06] implement runtime sync",
  state: "open",
  authorGithubUserId: "999",
  authorGithubLogin: "eman-dev",
  htmlUrl: "https://github.com/El-warsha/elwarsha-api/pull/42",
  mergedAt: null,
  createdAt: "2026-11-01T00:00:00Z",
  updatedAt: "2026-11-02T00:00:00Z",
  ...overrides,
});

const makeRepo = () => ({
  findEngagementId: vi.fn().mockResolvedValue("eng-1"),
  findAssignment: vi.fn().mockResolvedValue({ id: "assign-1", weekNumber: 6 }),
  findGithubUserId: vi.fn().mockResolvedValue(GITHUB_ID),
  listRepositories: vi.fn().mockResolvedValue([
    { id: "repo-api", githubOwner: "El-warsha", githubRepo: "elwarsha-api" },
    { id: "repo-web", githubOwner: "El-warsha", githubRepo: "elwarsha-web" },
  ]),
  saveSubmission: vi.fn().mockResolvedValue({ id: "sub-1", updatedAt: SAVED_AT }),
});

const makeGithub = (prsByRepo: Record<string, NormalizedPullRequestSummary[]> = {}) => ({
  listRepositoryPullRequests: vi.fn(
    async (_owner: string, repo: string) => prsByRepo[repo] ?? [],
  ),
});

describe("SubmissionsService.getSubmissions", () => {
  let repo: ReturnType<typeof makeRepo>;

  beforeEach(() => {
    repo = makeRepo();
  });

  const run = (github: ReturnType<typeof makeGithub>, week = 6) =>
    new SubmissionsService(repo as never, github as never).getSubmissions(
      USER_ID,
      "cohort-01",
      week,
    );

  const itemOf = (result: Awaited<ReturnType<typeof run>>, repositoryId: string) =>
    result.submissions.find((s) => s.productRepositoryId === repositoryId)!;

  describe("response", () => {
    it("returns the assignment and one item per product repository", async () => {
      const result = await run(makeGithub());

      expect(result.assignmentId).toBe("assign-1");
      expect(result.weekNumber).toBe(6);
      expect(result.submissions.map((s) => s.githubRepo)).toEqual([
        "elwarsha-api",
        "elwarsha-web",
      ]);
    });

    it("fills the persisted fields on every item", async () => {
      const result = await run(makeGithub());

      expect(itemOf(result, "repo-api")).toMatchObject({
        id: "sub-1",
        assignmentId: "assign-1",
        weekNumber: 6,
        githubOwner: "El-warsha",
        updatedAt: "2026-11-10T10:00:00.000Z",
      });
    });
  });

  describe("reconciliation rules", () => {
    it("is draft with no PR data when GitHub has no matching PR", async () => {
      const result = await run(makeGithub());

      expect(itemOf(result, "repo-api")).toMatchObject({
        status: "draft",
        prUrl: null,
        pullRequest: null,
      });
    });

    it("is in_review when the student's matching PR is open", async () => {
      const result = await run(makeGithub({ "elwarsha-api": [pr()] }));

      expect(itemOf(result, "repo-api")).toMatchObject({
        status: "in_review",
        prUrl: "https://github.com/El-warsha/elwarsha-api/pull/42",
        pullRequest: {
          number: 42,
          state: "open",
          htmlUrl: "https://github.com/El-warsha/elwarsha-api/pull/42",
        },
      });
    });

    it("is merged when the student's matching PR is merged", async () => {
      const merged = pr({ state: "merged", mergedAt: "2026-11-05T00:00:00Z" });
      const result = await run(makeGithub({ "elwarsha-api": [merged] }));

      expect(itemOf(result, "repo-api").status).toBe("merged");
    });

    it("prefers the merged PR when the student has both a merged and an open one", async () => {
      const open = pr({ githubPrId: "1", number: 1 });
      const merged = pr({
        githubPrId: "2",
        number: 2,
        state: "merged",
        mergedAt: "2026-11-05T00:00:00Z",
      });
      const result = await run(makeGithub({ "elwarsha-api": [open, merged] }));

      expect(itemOf(result, "repo-api")).toMatchObject({
        status: "merged",
        pullRequest: { number: 2 },
      });
    });

    it("evaluates every repository independently", async () => {
      const result = await run(makeGithub({ "elwarsha-api": [pr()] }));

      expect(itemOf(result, "repo-api").status).toBe("in_review");
      expect(itemOf(result, "repo-web").status).toBe("draft");
    });
  });

  describe("PRs that must be ignored", () => {
    it("ignores another student's PR", async () => {
      const result = await run(
        makeGithub({ "elwarsha-api": [pr({ authorGithubUserId: "123" })] }),
      );

      expect(itemOf(result, "repo-api").status).toBe("draft");
    });

    it("ignores a PR for a different week", async () => {
      const result = await run(
        makeGithub({ "elwarsha-api": [pr({ title: "[week-05] something" })] }),
      );

      expect(itemOf(result, "repo-api").status).toBe("draft");
    });

    it("ignores a PR whose title does not start with the week tag", async () => {
      const result = await run(
        makeGithub({ "elwarsha-api": [pr({ title: "Fix bug [week-06]" })] }),
      );

      expect(itemOf(result, "repo-api").status).toBe("draft");
    });

    it("ignores a PR closed without merging", async () => {
      const result = await run(makeGithub({ "elwarsha-api": [pr({ state: "closed" })] }));

      expect(itemOf(result, "repo-api").status).toBe("draft");
    });

    it("does not crash on a PR whose author was deleted", async () => {
      const result = await run(
        makeGithub({ "elwarsha-api": [pr({ authorGithubUserId: "" })] }),
      );

      expect(itemOf(result, "repo-api").status).toBe("draft");
    });
  });

  describe("persistence", () => {
    it("saves the snapshot of the matching PR for each repository", async () => {
      await run(makeGithub({ "elwarsha-api": [pr()] }));

      expect(repo.saveSubmission).toHaveBeenCalledTimes(2);
      expect(repo.saveSubmission).toHaveBeenCalledWith({
        assignmentId: "assign-1",
        authorUserId: USER_ID,
        productRepositoryId: "repo-api",
        status: "in_review",
        prUrl: "https://github.com/El-warsha/elwarsha-api/pull/42",
        pullRequest: { githubPrId: "5001", number: 42, state: "open" },
      });
    });

    it("saves pullRequest: null for draft so a stale snapshot is cleared", async () => {
      await run(makeGithub());

      expect(repo.saveSubmission).toHaveBeenCalledWith(
        expect.objectContaining({
          productRepositoryId: "repo-api",
          status: "draft",
          prUrl: null,
          pullRequest: null,
        }),
      );
    });
  });

  describe("student without a linked GitHub account", () => {
    it("returns draft everywhere and never calls GitHub", async () => {
      repo.findGithubUserId.mockResolvedValue(null);
      const github = makeGithub({ "elwarsha-api": [pr()] });

      const result = await run(github);

      expect(github.listRepositoryPullRequests).not.toHaveBeenCalled();
      expect(result.submissions.every((s) => s.status === "draft")).toBe(true);
      expect(repo.saveSubmission).toHaveBeenCalledTimes(2);
    });
  });

  describe("not found", () => {
    it("throws NotFoundError when the cohort has no engagement", async () => {
      repo.findEngagementId.mockResolvedValue(null);
      const github = makeGithub();

      await expect(run(github)).rejects.toBeInstanceOf(NotFoundError);
      expect(github.listRepositoryPullRequests).not.toHaveBeenCalled();
    });

    it("throws NotFoundError when there is no assignment for the week", async () => {
      repo.findAssignment.mockResolvedValue(null);
      const github = makeGithub();

      await expect(run(github, 99)).rejects.toBeInstanceOf(NotFoundError);
      expect(github.listRepositoryPullRequests).not.toHaveBeenCalled();
      expect(repo.saveSubmission).not.toHaveBeenCalled();
    });
  });

  describe("errors", () => {
    it("propagates a GitHub failure instead of saving partial data silently", async () => {
      const github = {
        listRepositoryPullRequests: vi.fn().mockRejectedValue(new Error("GitHub down")),
      };

      await expect(run(github as never)).rejects.toThrow("GitHub down");
    });
  });
});

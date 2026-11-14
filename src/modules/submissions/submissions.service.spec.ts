import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GithubAppClient, NormalizedPullRequestSummary } from "../github/github.ports.js";
import { SubmissionsService } from "./submissions.service.js";

describe("SubmissionsService", () => {
  const mockPrisma = {
    assignment: {
      findFirst: vi.fn(),
    },
    externalIdentity: {
      findFirst: vi.fn(),
    },
    submission: {
      upsert: vi.fn(),
    },
  };

  const mockGithubClient: Pick<GithubAppClient, "listRepositoryPullRequests"> = {
    listRepositoryPullRequests: vi.fn(),
  };

  let service: SubmissionsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SubmissionsService(
      mockPrisma as never,
      mockGithubClient as unknown as GithubAppClient,
    );
  });

  it("throws NotFoundException when no active assignment exists for the week", async () => {
    mockPrisma.assignment.findFirst.mockResolvedValue(null);

    await expect(
      service.getOrSyncStudentWeekSubmission("user-1", "cohort-1", 6),
    ).rejects.toThrow(NotFoundException);

    expect(mockGithubClient.listRepositoryPullRequests).not.toHaveBeenCalled();
  });

  it("returns draft without calling GitHub when student has no linked GitHub identity", async () => {
    mockPrisma.assignment.findFirst.mockResolvedValue({ id: "assign-6" });
    mockPrisma.externalIdentity.findFirst.mockResolvedValue(null);

    const result = await service.getOrSyncStudentWeekSubmission("user-1", "cohort-1", 6);

    expect(result).toEqual({
      weekNumber: 6,
      status: "draft",
      prNumber: null,
      prUrl: null,
      prTitle: null,
    });
    expect(mockGithubClient.listRepositoryPullRequests).not.toHaveBeenCalled();
  });

  it("syncs and returns in_review when matching open PR is found in either repo", async () => {
    mockPrisma.assignment.findFirst.mockResolvedValue({ id: "assign-6" });
    mockPrisma.externalIdentity.findFirst.mockResolvedValue({
      githubUserId: BigInt(999),
      providerSubject: "999",
    });

    const openPr: NormalizedPullRequestSummary = {
      number: 42,
      title: "[week-06] add submissions feature",
      htmlUrl: "https://github.com/El-Warsha/elwarsha-api/pull/42",
      state: "open",
      authorGithubUserId: "999",
    };

    vi.mocked(mockGithubClient.listRepositoryPullRequests)
      .mockResolvedValueOnce([openPr])
      .mockResolvedValueOnce([]);

    const result = await service.getOrSyncStudentWeekSubmission("user-1", "cohort-1", 6);

    expect(mockPrisma.submission.upsert).toHaveBeenCalledWith({
      where: {
        assignmentId_authorUserId: {
          assignmentId: "assign-6",
          authorUserId: "user-1",
        },
      },
      update: {
        status: "in_review",
        prUrl: "https://github.com/El-Warsha/elwarsha-api/pull/42",
      },
      create: {
        assignmentId: "assign-6",
        authorUserId: "user-1",
        status: "in_review",
        prUrl: "https://github.com/El-Warsha/elwarsha-api/pull/42",
      },
    });

    expect(result).toEqual({
      weekNumber: 6,
      status: "in_review",
      prNumber: 42,
      prUrl: "https://github.com/El-Warsha/elwarsha-api/pull/42",
      prTitle: "[week-06] add submissions feature",
    });
  });

  it("prioritizes merged PR over open PR for the same week", async () => {
    mockPrisma.assignment.findFirst.mockResolvedValue({ id: "assign-6" });
    mockPrisma.externalIdentity.findFirst.mockResolvedValue({
      githubUserId: BigInt(999),
      providerSubject: "999",
    });

    const openPr: NormalizedPullRequestSummary = {
      number: 41,
      title: "[week-06] first draft",
      htmlUrl: "https://github.com/El-Warsha/elwarsha-api/pull/41",
      state: "open",
      authorGithubUserId: "999",
    };
    const mergedPr: NormalizedPullRequestSummary = {
      number: 45,
      title: "[week-06] final solution",
      htmlUrl: "https://github.com/El-Warsha/elwarsha-web/pull/45",
      state: "merged",
      authorGithubUserId: "999",
    };

    vi.mocked(mockGithubClient.listRepositoryPullRequests)
      .mockResolvedValueOnce([openPr])
      .mockResolvedValueOnce([mergedPr]);

    const result = await service.getOrSyncStudentWeekSubmission("user-1", "cohort-1", 6);

    expect(result.status).toBe("merged");
    expect(result.prNumber).toBe(45);
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SubmissionsService } from './submissions.service.js';
import type { SubmissionsRepository } from './submissions.repository.js';
import type { GithubAppClient } from '../github/github.ports.js';

describe('SubmissionsService', () => {
  let service: SubmissionsService;
  let repoMock: Partial<SubmissionsRepository>;
  let githubClientMock: Partial<GithubAppClient>;

  const mockAssignment = {
    id: 'assignment-uuid-1',
    weekNumber: 6,
    engagement: {
      product: {
        repositories: [
          {
            id: 'repo-uuid-1',
            githubOwner: 'El-warsha',
            githubRepo: 'elwarsha-api',
          },
        ],
      },
    },
  };

  beforeEach(() => {
    repoMock = {
      getGithubUserId: vi.fn(),
      getAssignmentWithRepositories: vi.fn(),
      upsertSubmission: vi.fn().mockResolvedValue({
        id: 'submission-uuid-1',
        updatedAt: new Date('2026-11-11T12:00:00Z'),
      }),
    };

    githubClientMock = {
      listRepositoryPullRequests: vi.fn(),
    };

    service = new SubmissionsService(
      repoMock as SubmissionsRepository,
      githubClientMock as GithubAppClient,
    );
  });

  it('throws BadRequestException when student has no connected github account', async () => {
    vi.mocked(repoMock.getGithubUserId!).mockResolvedValue(null);

    await expect(
      service.getAssignmentSubmissions('user-1', 'cohort-01', 6),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws NotFoundException when assignment is not found', async () => {
    vi.mocked(repoMock.getGithubUserId!).mockResolvedValue(1001n);
    vi.mocked(repoMock.getAssignmentWithRepositories!).mockResolvedValue(null);

    await expect(
      service.getAssignmentSubmissions('user-1', 'cohort-01', 6),
    ).rejects.toThrow(NotFoundException);
  });

  it('reconciles open PR as in_review and upserts snapshot', async () => {
    vi.mocked(repoMock.getGithubUserId!).mockResolvedValue(1001n);
    vi.mocked(repoMock.getAssignmentWithRepositories!).mockResolvedValue(mockAssignment as any);
    vi.mocked(githubClientMock.listRepositoryPullRequests!).mockResolvedValue([
      {
        githubPrId: '6001',
        number: 42,
        title: '[week-06] runtime sync',
        state: 'open',
        authorGithubUserId: '1001',
        htmlUrl: 'https://github.com/El-warsha/elwarsha-api/pull/42',
        mergedAt: null,
        createdAt: '2026-11-11T10:00:00Z',
        updatedAt: '2026-11-11T10:30:00Z',
      },
    ]);

    const result = await service.getAssignmentSubmissions('user-1', 'cohort-01', 6);

    expect(result.submissions[0].status).toBe('in_review');
    expect(result.submissions[0].pullRequest?.number).toBe(42);
    expect(repoMock.upsertSubmission).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'in_review',
        assignmentId: 'assignment-uuid-1',
      }),
    );
  });

  it('reconciles merged PR as merged', async () => {
    vi.mocked(repoMock.getGithubUserId!).mockResolvedValue(1001n);
    vi.mocked(repoMock.getAssignmentWithRepositories!).mockResolvedValue(mockAssignment as any);
    vi.mocked(githubClientMock.listRepositoryPullRequests!).mockResolvedValue([
      {
        githubPrId: '6001',
        number: 42,
        title: '[week-06] runtime sync',
        state: 'merged',
        authorGithubUserId: '1001',
        htmlUrl: 'https://github.com/El-warsha/elwarsha-api/pull/42',
        mergedAt: '2026-11-11T11:00:00Z',
        createdAt: '2026-11-11T10:00:00Z',
        updatedAt: '2026-11-11T11:00:00Z',
      },
    ]);

    const result = await service.getAssignmentSubmissions('user-1', 'cohort-01', 6);

    expect(result.submissions[0].status).toBe('merged');
  });

  it('reconciles unmatched or missing PR as draft with null URLs', async () => {
    vi.mocked(repoMock.getGithubUserId!).mockResolvedValue(1001n);
    vi.mocked(repoMock.getAssignmentWithRepositories!).mockResolvedValue(mockAssignment as any);
    vi.mocked(githubClientMock.listRepositoryPullRequests!).mockResolvedValue([
      {
        githubPrId: '9999',
        number: 99,
        title: '[week-06] someone else work',
        state: 'open',
        authorGithubUserId: '2002', // مستخدم آخر
        htmlUrl: 'https://github.com/El-warsha/elwarsha-api/pull/99',
        mergedAt: null,
        createdAt: '2026-11-11T10:00:00Z',
        updatedAt: '2026-11-11T10:30:00Z',
      },
    ]);

    const result = await service.getAssignmentSubmissions('user-1', 'cohort-01', 6);

    expect(result.submissions[0].status).toBe('draft');
    expect(result.submissions[0].prUrl).toBeNull();
    expect(result.submissions[0].pullRequest).toBeNull();
  });

  it('handles multi-repo products where one repo has a PR and another does not', async () => {
    const multiRepoAssignment = {
      id: 'assignment-uuid-1',
      weekNumber: 6,
      engagement: {
        product: {
          repositories: [
            { id: 'repo-api', githubOwner: 'El-warsha', githubRepo: 'elwarsha-api' },
            { id: 'repo-web', githubOwner: 'El-warsha', githubRepo: 'elwarsha-web' },
          ],
        },
      },
    };

    vi.mocked(repoMock.getGithubUserId!).mockResolvedValue(1001n);
    vi.mocked(repoMock.getAssignmentWithRepositories!).mockResolvedValue(multiRepoAssignment as any);

    vi.mocked(githubClientMock.listRepositoryPullRequests!)
      .mockResolvedValueOnce([
        {
          githubPrId: '6001',
          number: 42,
          title: '[week-06] api submission',
          state: 'open',
          authorGithubUserId: '1001',
          htmlUrl: 'https://github.com/El-warsha/elwarsha-api/pull/42',
          mergedAt: null,
          createdAt: '2026-11-11T10:00:00Z',
          updatedAt: '2026-11-11T10:30:00Z',
        },
      ])
      .mockResolvedValueOnce([]);

    const result = await service.getAssignmentSubmissions('user-1', 'cohort-01', 6);

    expect(result.submissions).toHaveLength(2);
    expect(result.submissions[0].githubRepo).toBe('elwarsha-api');
    expect(result.submissions[0].status).toBe('in_review');

    expect(result.submissions[1].githubRepo).toBe('elwarsha-web');
    expect(result.submissions[1].status).toBe('draft');
    expect(result.submissions[1].prUrl).toBeNull();

    expect(repoMock.upsertSubmission).toHaveBeenCalledTimes(2);
  });

  it('matches case-insensitive titles without zero-padding like [WEEK-6]', async () => {
    vi.mocked(repoMock.getGithubUserId!).mockResolvedValue(1001n);
    vi.mocked(repoMock.getAssignmentWithRepositories!).mockResolvedValue(mockAssignment as any);
    vi.mocked(githubClientMock.listRepositoryPullRequests!).mockResolvedValue([
      {
        githubPrId: '6001',
        number: 42,
        title: '[WEEK-6] alternative case title',
        state: 'open',
        authorGithubUserId: '1001',
        htmlUrl: 'https://github.com/El-warsha/elwarsha-api/pull/42',
        mergedAt: null,
        createdAt: '2026-11-11T10:00:00Z',
        updatedAt: '2026-11-11T10:30:00Z',
      },
    ]);

    const result = await service.getAssignmentSubmissions('user-1', 'cohort-01', 6);
    expect(result.submissions[0].status).toBe('in_review');
  });

  it('ignores PRs belonging to previous weeks like [week-05]', async () => {
    vi.mocked(repoMock.getGithubUserId!).mockResolvedValue(1001n);
    vi.mocked(repoMock.getAssignmentWithRepositories!).mockResolvedValue(mockAssignment as any);
    vi.mocked(githubClientMock.listRepositoryPullRequests!).mockResolvedValue([
      {
        githubPrId: '5001',
        number: 30,
        title: '[week-05] old assignment',
        state: 'open',
        authorGithubUserId: '1001',
        htmlUrl: 'https://github.com/El-warsha/elwarsha-api/pull/30',
        mergedAt: null,
        createdAt: '2026-11-04T10:00:00Z',
        updatedAt: '2026-11-04T10:30:00Z',
      },
    ]);

    const result = await service.getAssignmentSubmissions('user-1', 'cohort-01', 6);
    expect(result.submissions[0].status).toBe('draft');
  });

  it('handles PRs without author ID gracefully without throwing BigInt errors', async () => {
    vi.mocked(repoMock.getGithubUserId!).mockResolvedValue(1001n);
    vi.mocked(repoMock.getAssignmentWithRepositories!).mockResolvedValue(mockAssignment as any);
    vi.mocked(githubClientMock.listRepositoryPullRequests!).mockResolvedValue([
      {
        githubPrId: '7001',
        number: 55,
        title: '[week-06] ghost author PR',
        state: 'open',
        authorGithubUserId: undefined as any,
        htmlUrl: 'https://github.com/El-warsha/elwarsha-api/pull/55',
        mergedAt: null,
        createdAt: '2026-11-11T10:00:00Z',
        updatedAt: '2026-11-11T10:30:00Z',
      },
    ]);

    const result = await service.getAssignmentSubmissions('user-1', 'cohort-01', 6);
    expect(result.submissions[0].status).toBe('draft');
  });

  it('handles empty repositories array gracefully', async () => {
    const emptyRepoAssignment = {
      id: 'assignment-uuid-1',
      weekNumber: 6,
      engagement: {
        product: {
          repositories: [],
        },
      },
    };

    vi.mocked(repoMock.getGithubUserId!).mockResolvedValue(1001n);
    vi.mocked(repoMock.getAssignmentWithRepositories!).mockResolvedValue(emptyRepoAssignment as any);

    const result = await service.getAssignmentSubmissions('user-1', 'cohort-01', 6);
    expect(result.submissions).toEqual([]);
    expect(repoMock.upsertSubmission).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubmissionsRepository } from './submissions.repository.js';

describe('SubmissionsRepository', () => {
  let repository: SubmissionsRepository;

  const prismaMock = {
    externalIdentity: {
      findFirst: vi.fn(),
    },
    assignment: {
      findFirst: vi.fn(),
    },
    submission: {
      upsert: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    repository = new SubmissionsRepository(
      prismaMock as any,
    );

    prismaMock.submission.upsert.mockResolvedValue({
      id: 'submission-1',
      updatedAt: new Date('2026-11-13T12:00:00Z'),
    });
  });

  const submissionData = {
    assignmentId: 'assignment-1',
    userId: 'user-1',
    productRepositoryId: 'repo-1',
    status: 'in_review' as const,
    prUrl: 'https://github.com/El-warsha/elwarsha-api/pull/42',
    pullRequest: {
      githubPrId: '6001',
      number: 42,
      state: 'open' as const,
      updatedAt: '2026-11-13T10:00:00Z',
    },
  };

  it('creates a new submission with a PR snapshot', async () => {
    await repository.upsertSubmission(submissionData);

    expect(prismaMock.submission.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          assignmentId_authorUserId_productRepositoryId: {
            assignmentId: 'assignment-1',
            authorUserId: 'user-1',
            productRepositoryId: 'repo-1',
          },
        },
        create: expect.objectContaining({
          assignmentId: 'assignment-1',
          authorUserId: 'user-1',
          productRepositoryId: 'repo-1',
          status: 'in_review',
          prUrl: submissionData.prUrl,
          pullRequest: {
            create: {
              githubPrId: 6001n,
              number: 42,
              state: 'open',
              updatedAt: new Date('2026-11-13T10:00:00Z'),
            },
          },
        }),
      }),
    );
  });

  it('updates an existing submission and its PR snapshot', async () => {
    await repository.upsertSubmission(submissionData);

    const call = prismaMock.submission.upsert.mock.calls[0][0];

    expect(call.update).toEqual(
      expect.objectContaining({
        status: 'in_review',
        prUrl: submissionData.prUrl,
        pullRequest: {
          upsert: {
            create: {
              githubPrId: 6001n,
              number: 42,
              state: 'open',
              updatedAt: new Date('2026-11-13T10:00:00Z'),
            },
            update: {
              githubPrId: 6001n,
              number: 42,
              state: 'open',
              updatedAt: new Date('2026-11-13T10:00:00Z'),
            },
          },
        },
      }),
    );
  });

  it('updates submission without creating a PR snapshot when PR is missing', async () => {
    await repository.upsertSubmission({
      ...submissionData,
      status: 'draft',
      prUrl: null,
      pullRequest: null,
    });

    const call = prismaMock.submission.upsert.mock.calls[0][0];

    expect(call.create.pullRequest).toBeUndefined();
    expect(call.update.pullRequest).toBeUndefined();
    expect(call.create.status).toBe('draft');
    expect(call.update.prUrl).toBeNull();
  });

  it('converts GitHub PR ID to BigInt', async () => {
    await repository.upsertSubmission(submissionData);

    const call = prismaMock.submission.upsert.mock.calls[0][0];

    expect(typeof call.create.pullRequest.create.githubPrId).toBe('bigint');
    expect(call.create.pullRequest.create.githubPrId).toBe(6001n);
  });

  it('converts PR updatedAt string to Date', async () => {
    await repository.upsertSubmission(submissionData);

    const call = prismaMock.submission.upsert.mock.calls[0][0];

    expect(call.create.pullRequest.create.updatedAt).toBeInstanceOf(Date);
  });

  it('returns the persisted submission result', async () => {
    const result = await repository.upsertSubmission(submissionData);

    expect(result.id).toBe('submission-1');
    expect(result.updatedAt).toEqual(
      new Date('2026-11-13T12:00:00Z'),
    );
  });
});

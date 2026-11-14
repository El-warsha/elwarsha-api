import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubmissionsController } from './submissions.controller.js';
import type { SubmissionsService } from './submissions.service.js';

describe('SubmissionsController', () => {
  let controller: SubmissionsController;
  let serviceMock: {
    getAssignmentSubmissions: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    serviceMock = {
      getAssignmentSubmissions: vi.fn(),
    };

    controller = new SubmissionsController(serviceMock as unknown as SubmissionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates getSubmissions to SubmissionsService with actor user id', async () => {
    const expectedResponse = {
      assignmentId: 'assign-1',
      weekNumber: 6,
      submissions: [],
    };
    serviceMock.getAssignmentSubmissions.mockResolvedValue(expectedResponse);

    const mockRequest = {
      actor: {
        user: { id: 'user-uuid-1' },
      },
    } as any;

    const result = await controller.getSubmissions('cohort-01', 6, mockRequest);

    expect(serviceMock.getAssignmentSubmissions).toHaveBeenCalledWith(
      'user-uuid-1',
      'cohort-01',
      6,
    );
    expect(result).toBe(expectedResponse);
  });
});
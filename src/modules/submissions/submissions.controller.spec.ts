import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request } from "express";

import { UnauthorizedError } from "../../common/errors.js";
import type { AuthenticatedActor } from "../identity/identity.ports.js";
import { SubmissionsController } from "./submissions.controller.js";
import type { SubmissionsService } from "./submissions.service.js";

type ActorRequest = Request & { actor?: AuthenticatedActor };

function requestWithActor(actor?: AuthenticatedActor): ActorRequest {
  return { actor } as ActorRequest;
}

describe("SubmissionsController", () => {
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

  it("delegates to the service with the cohort, week, and current user", async () => {
    serviceMock.getAssignmentSubmissions.mockResolvedValue({
      assignmentId: "assignment-6",
      weekNumber: 6,
      submissions: [],
    });

    const actor = {
      user: { id: "user-1" },
    } as AuthenticatedActor;

    const result = await controller.getAssignmentSubmissions(
      "cohort-01",
      6,
      requestWithActor(actor),
    );

    expect(serviceMock.getAssignmentSubmissions).toHaveBeenCalledWith(
      "cohort-01",
      6,
      "user-1",
    );
    expect(result).toEqual({
      assignmentId: "assignment-6",
      weekNumber: 6,
      submissions: [],
    });
  });

  it("throws UnauthorizedError when no actor is attached to the request", async () => {
    await expect(
      controller.getAssignmentSubmissions("cohort-01", 6, requestWithActor()),
    ).rejects.toThrow(UnauthorizedError);
  });
});

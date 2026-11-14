import { beforeEach, describe, expect, it, vi } from "vitest";

import { UnauthorizedError } from "../../common/errors.js";
import type { AuthenticatedActor } from "../identity/identity.ports.js";
import { SubmissionsController } from "./submissions.controller.js";
import type { SubmissionsService } from "./submissions.service.js";

describe("SubmissionsController", () => {
  let controller: SubmissionsController;
  let serviceMock: {
    getSubmissions: ReturnType<typeof vi.fn>;
  };

  const actor: AuthenticatedActor = {
    user: {
      id: "user-1",
      displayName: "Test User",
      email: "test@elwarsha.dev",
      locale: "ar",
    },
    session: {
      id: "session-1",
      userId: "user-1",
      tokenHash: "hash",
      expiresAt: new Date(Date.now() + 3600_000),
      revokedAt: null,
    },
    roles: ["participant"],
    capabilities: ["submissions.read"],
    memberships: [],
  };

  beforeEach(() => {
    serviceMock = {
      getSubmissions: vi.fn(),
    };

    controller = new SubmissionsController(serviceMock as unknown as SubmissionsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("delegates getSubmissions with authenticated actor user id", async () => {
    const mockResponse = {
      assignmentId: "assign-1",
      weekNumber: 6,
      submissions: [],
    };
    serviceMock.getSubmissions.mockResolvedValue(mockResponse);

    const result = await controller.getSubmissions("cohort-01", 6, {
      actor,
    } as never);

    expect(serviceMock.getSubmissions).toHaveBeenCalledWith("user-1", "cohort-01", 6);
    expect(result).toEqual(mockResponse);
  });

  it("throws UnauthorizedError when actor is missing", async () => {
    await expect(
      controller.getSubmissions("cohort-01", 6, {} as never),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});

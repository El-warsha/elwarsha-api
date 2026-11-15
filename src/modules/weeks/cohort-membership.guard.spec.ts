import type { ExecutionContext } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ForbiddenError, UnauthorizedError } from "../../common/errors.js";
import type { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import { CohortMembershipGuard } from "./cohort-membership.guard.js";

describe("CohortMembershipGuard", () => {
  let guard: CohortMembershipGuard;
  let prismaMock: {
    membership: {
      findFirst: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prismaMock = {
      membership: {
        findFirst: vi.fn(),
      },
    };
    guard = new CohortMembershipGuard(prismaMock as unknown as PrismaService);
  });

  function createMockContext(request: unknown): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  it("throws UnauthorizedError when request has no authenticated actor", async () => {
    const context = createMockContext({ params: { cohortSlug: "cohort-01" } });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedError);
  });

  it("allows admins to access any cohort without specific membership", async () => {
    const context = createMockContext({
      actor: {
        user: { id: "admin-1" },
        roles: ["admin"],
        capabilities: ["weeks.read"],
      },
      params: { cohortSlug: "cohort-99" },
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(prismaMock.membership.findFirst).not.toHaveBeenCalled();
  });

  it("allows maintainers to access any cohort without specific membership", async () => {
    const context = createMockContext({
      actor: {
        user: { id: "maintainer-1" },
        roles: ["maintainer"],
        capabilities: ["weeks.read"],
      },
      params: { cohortSlug: "cohort-99" },
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(prismaMock.membership.findFirst).not.toHaveBeenCalled();
  });

  it("allows enrolled participant when membership exists for cohortSlug", async () => {
    prismaMock.membership.findFirst.mockResolvedValue({ id: "mem-1" });

    const context = createMockContext({
      actor: {
        user: { id: "part-1" },
        roles: ["participant"],
        capabilities: ["weeks.read"],
      },
      params: { cohortSlug: "cohort-01" },
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(prismaMock.membership.findFirst).toHaveBeenCalledWith({
      where: {
        userId: "part-1",
        engagement: {
          cohort: {
            slug: "cohort-01",
          },
        },
      },
    });
  });

  it("throws ForbiddenError (403) when participant is not enrolled in the cohort", async () => {
    prismaMock.membership.findFirst.mockResolvedValue(null);

    const context = createMockContext({
      actor: {
        user: { id: "part-1" },
        roles: ["participant"],
        capabilities: ["weeks.read"],
      },
      params: { cohortSlug: "cohort-02" },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenError);
  });
});

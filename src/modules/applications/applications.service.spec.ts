import { beforeEach, describe, expect, it } from "vitest";

import { ConflictError } from "../../common/errors.js";
import { ApplicationsService } from "./applications.service.js";
import type { ApplyCohortDto } from "./dto/apply-cohort.dto.js";

function makeDto(overrides: Partial<ApplyCohortDto> = {}): ApplyCohortDto {
  return {
    fullName: "Sara Ahmed",
    email: "sara@example.com",
    whatsappNumber: "+201012345678",
    githubHandle: "sara-dev",
    discordHandle: "sara",
    currentStatus: "student",
    collegeMajor: "CS",
    programmingExperience: "1 year",
    technologies: "JavaScript",
    gitExperience: "basics",
    personalPageUrl: "https://sara.dev",
    githubRepoUrl: "https://github.com/sara-dev/page",
    aiUsage: "Proofreading only",
    motivation: "I want to build real products with a team and grow as an engineer.",
    ...overrides,
  } as ApplyCohortDto;
}

describe("ApplicationsService", () => {
  let service: ApplicationsService;

  beforeEach(() => {
    service = new ApplicationsService();
  });

  it("returns a receipt with an app_ id and status received", async () => {
    const receipt = await service.apply("cohort-2", makeDto());

    expect(receipt.id).toMatch(/^app_/);
    expect(receipt.status).toBe("received");
    expect(receipt.cohortSlug).toBe("cohort-2");
    expect(receipt.email).toBe("sara@example.com");
  });

  it("rejects duplicate email ignoring case", async () => {
    await service.apply("cohort-2", makeDto({ email: "sara@example.com" }));

    await expect(
      service.apply(
        "cohort-2",
        makeDto({ email: "Sara@Example.com", githubHandle: "other-handle" }),
      ),
    ).rejects.toThrow(ConflictError);
  });

  it("rejects duplicate GitHub handle with a different email", async () => {
    await service.apply("cohort-2", makeDto());

    await expect(
      service.apply("cohort-2", makeDto({ email: "different@example.com" })),
    ).rejects.toThrow(ConflictError);
  });

  it("accepts the same applicant in a different cohort", async () => {
    await service.apply("cohort-2", makeDto());

    const receipt = await service.apply("cohort-3", makeDto());

    expect(receipt.cohortSlug).toBe("cohort-3");
    expect(receipt.status).toBe("received");
  });

  it("reset() clears state so the same applicant can apply again", async () => {
    await service.apply("cohort-2", makeDto());
    service.reset();

    const receipt = await service.apply("cohort-2", makeDto());

    expect(receipt.status).toBe("received");
    expect(await service.findByCohort("cohort-2")).toHaveLength(1);
  });
});
import { beforeEach, describe, expect, it } from "vitest";
import { ConflictError } from "../../common/errors.js";
import type { ApplyCohortDto } from "./dto/apply-cohort.dto.js";
import { ApplicationsService } from "./applications.service.js";

// ⚠️ لو الـ DTO فيه حقول إجبارية تانية، ضيفيها هنا (مرة واحدة بس)
const makeDto = (overrides: Partial<ApplyCohortDto> = {}): ApplyCohortDto =>
  ({
    fullName: "Sara Mahmoud",
    email: "sara@example.com",
    whatsappNumber: "+201012345678",
    githubHandle: "sara-dev",
    discordHandle: "sara",
    ...overrides,
  }) as ApplyCohortDto;

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
  });

  it("rejects duplicate email ignoring case", async () => {
    await service.apply("cohort-2", makeDto({ email: "sara@example.com" }));

    await expect(
      service.apply(
        "cohort-2",
        makeDto({ email: "SARA@Example.com", githubHandle: "other-dev" }),
      ),
    ).rejects.toThrow(ConflictError);
  });

  it("rejects duplicate GitHub handle with a different email", async () => {
    await service.apply("cohort-2", makeDto());

    await expect(
      service.apply("cohort-2", makeDto({ email: "other@example.com" })),
    ).rejects.toThrow(ConflictError);
  });

  it("accepts the same applicant in a different cohort", async () => {
    await service.apply("cohort-2", makeDto());

    await expect(service.apply("cohort-3", makeDto())).resolves.toMatchObject({
      cohortSlug: "cohort-3",
      status: "received",
    });
  });

  it("reset() clears state so the same applicant can apply again", async () => {
    await service.apply("cohort-2", makeDto());
    service.reset();

    await expect(service.apply("cohort-2", makeDto())).resolves.toMatchObject({
      status: "received",
    });
  });
});
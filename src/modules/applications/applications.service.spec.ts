import { describe, it, expect, beforeEach } from "vitest";
import { ApplicationsService } from "./applications.service.js";
import { ConflictError } from "../../common/errors.js";
import { ApplyCohortDto } from "./dto/apply-cohort.dto.js";
function makeDto(overrides: Partial<ApplyCohortDto> = {}): ApplyCohortDto {
  return {
    email: "sara@example.com",
    githubHandle: "sara-dev",
    ...overrides,
  } as ApplyCohortDto;
}
describe("ApplicationsService", () => {
  let service: ApplicationsService;
  beforeEach(() => {
    service = new ApplicationsService();
  });

  it("returns a receipt with an app_ id and status received", async () => {
    const receipt = await service.apply("cohort-01", makeDto());

    expect(receipt.id).toMatch(/^app_[0-9a-f]{8}$/);
    expect(receipt.status).toBe("received");
    expect(receipt.cohortSlug).toBe("cohort-01");
  });

  it("rejects duplicate email ignoring case", async () => {
    await service.apply("cohort-01", makeDto());

    await expect(
      service.apply(
        "cohort-01",
        makeDto({ email: "SARA@Example.com", githubHandle: "other-github handle" }),
      ),
    ).rejects.toThrow(ConflictError);
  });

  it("rejects duplicate github handle with a different email", async () => {
    await service.apply("cohort-01", makeDto());

    await expect(
      service.apply("cohort-01", makeDto({ email: "different@example.com" })),
    ).rejects.toThrow(ConflictError);
  });

  it("accepts the same applicant in a different cohort", async () => {
    await service.apply("cohort-01", makeDto());

    const receipt = await service.apply("cohort-02", makeDto());
    expect(receipt.status).toBe("received");
  });

  it("reset() clears state", async () => {
    await service.apply("cohort-01", makeDto());
    service.reset();

    await expect(service.apply("cohort-01", makeDto())).resolves.toMatchObject({
      status: "received",
    });
  });
});

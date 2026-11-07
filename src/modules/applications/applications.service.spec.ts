
import { beforeEach, describe, expect, it } from "vitest";
import { ApplicationsService } from "./applications.service.js";
import { ConflictError } from "../../common/errors.js";
import { ApplyCohortDto } from "./dto/apply-cohort.dto.js";

describe("ApplicationService", () => {
  let Service: ApplicationsService;

  beforeEach(() => {
    Service = new ApplicationsService();
  });

  const dto: ApplyCohortDto = {
    fullName: "Ahmed Mohamed Ali",
    email: "ahmed@example.com",
    whatsappNumber: "+201012345678",
    githubHandle: "ahmed-mohamed",
    discordHandle: "ahmed_dev",
    currentStatus: "student",
    collegeMajor: "Computer Engineering",
    programmingExperience: "2 years",
    technologies: "JavaScript, TypeScript, React",
    gitExperience: "basics",
    personalPageUrl: "https://ahmed.github.io",
    githubRepoUrl: "https://github.com/ahmed/my-page",
    aiUsage: "Used AI tools for debugging and code assistance.",
    motivation:
      "I want to join ElWarsha to improve my practical development skills and work on real projects.",
  };

  // valid application
  it("should return a valid application receipt", async () => {
    const application = await Service.apply("cohort-1", dto);

    expect(application.id).toMatch(/^app_/);
    expect(application.status).toBe("received");
    expect(application.email).toBe(dto.email);
    expect(application.cohortSlug).toBe("cohort-1");
  });

  // Duplicate email ignoring case
  it("should reject duplicate email ignoring case", async () => {
    const dto1 = {
      ...dto,
      email: "Sara@example.com",
      githubHandle: "sara",
    };

    await Service.apply("cohort-1", dto1);

    const dto2 = {
      ...dto,
      email: "sara@example.com",
      githubHandle: "sara-hassan",
    };

    await expect(
      Service.apply("cohort-1", dto2)
    ).rejects.toThrow(ConflictError);
  });

  // Duplicate GitHub handle
  it("should reject duplicate GitHub handle", async () => {
    const dto1 = {
      ...dto,
      email: "sara00@example.com",
      githubHandle: "sara-hassan",
    };

    await Service.apply("cohort-1", dto1);

    const dto2 = {
      ...dto,
      email: "sara@example.com",
      githubHandle: "sara-hassan",
    };

    await expect(
      Service.apply("cohort-1", dto2)
    ).rejects.toThrow(ConflictError);
  });

  // Same applicant in a different cohort
  it("should accept same application in a different cohort", async () => {
    const application1 = await Service.apply("cohort-1", dto);
    const application2 = await Service.apply("cohort-2", dto);

    expect(application1.cohortSlug).toBe("cohort-1");
    expect(application2.cohortSlug).toBe("cohort-2");
  });

  // Reset
  it("should reset the applications", async () => {
    await Service.apply("cohort-1", dto);
    await Service.reset();

    const applications = await Service.findByCohort("cohort-1");
    expect(applications).toHaveLength(0);
  });
});


import { ApplicationsService } from "./applications.service.js";
import { ConflictError } from "../../common/errors.js";
import { ApplyCohortDto } from "./dto/apply-cohort.dto.js";

describe("ApplicationsService", () => {
  let service: ApplicationsService;

  const createDto = (
    overrides: Partial<ApplyCohortDto> = {},
  ): ApplyCohortDto => ({
    fullName: "Mohamed Elsayed",
    email: "mohamed@example.com",
    whatsappNumber: "+201012345678",
    githubHandle: "mohamedsayed62",
    discordHandle: "mohamed_dev",
    currentStatus: "student",
    collegeMajor: "Faculty of Specific Education - Educational Technology",
    programmingExperience: "2 years",
    technologies: "PHP, Laravel, MySQL, JavaScript, TypeScript",
    gitExperience: "comfortable",
    personalPageUrl: "https://mohamedsayed.vercel.app",
    githubRepoUrl: "https://github.com/mohamedsayed62/portfolio",
    aiUsage: "Used AI tools for debugging and code suggestions.",
    motivation:
      "I want to join ElWarsha to improve my development skills through practical projects and code reviews.",
    ...overrides,
  });

  beforeEach(() => {
    service = new ApplicationsService();
  });

  it("should accept a valid application and return a receipt", async () => {
    const result = await service.apply("cohort-2", createDto());

    expect(result).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^app_/),
        cohortSlug: "cohort-2",
        email: "mohamed@example.com",
        status: "received",
        createdAt: expect.any(String),
      }),
    );
  });

  it("should reject duplicate emails regardless of letter case", async () => {
    await service.apply("cohort-2", createDto());

    await expect(
      service.apply(
        "cohort-2",
        createDto({
          email: "MOHAMED@EXAMPLE.COM",
          githubHandle: "another-github-user",
        }),
      ),
    ).rejects.toThrow(ConflictError);
  });

  it("should reject duplicate GitHub handles with different emails", async () => {
    await service.apply("cohort-2", createDto());

    await expect(
      service.apply(
        "cohort-2",
        createDto({
          email: "another@example.com",
          githubHandle: "MOHAMEDSAYED62",
        }),
      ),
    ).rejects.toThrow(ConflictError);
  });

  it("should accept the same applicant in a different cohort", async () => {
    await service.apply("cohort-2", createDto());

    const result = await service.apply("cohort-3", createDto());

    expect(result).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^app_/),
        cohortSlug: "cohort-3",
        email: "mohamed@example.com",
        status: "received",
      }),
    );
  });

  it("should clear all applications when reset is called", async () => {
    await service.apply("cohort-2", createDto());

    service.reset();

    const result = await service.apply("cohort-2", createDto());

    expect(result.status).toBe("received");
    expect(result.id).toMatch(/^app_/);

    const applications = await service.findByCohort("cohort-2");

    expect(applications).toHaveLength(1);
  });
});

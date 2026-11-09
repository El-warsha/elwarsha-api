import { ApplicationsService } from "./applications.service.js";
import { ApplyCohortDto } from "./dto/apply-cohort.dto.js";
import { ConflictError } from "../../common/errors.js";

describe("ApplicationsService", () => {
  let service: ApplicationsService;

  const applyCohortDtoMocked: ApplyCohortDto = {
    fullName: "eman",
    email: "eman@example.com",
    whatsappNumber: "+201234567890",
    githubHandle: "eman123",
    discordHandle: "eman#1234",
    currentStatus: "student",
    collegeMajor: "Faculty of Science - CS Department",
    programmingExperience: "1 year",
    technologies: "JavaScript, TypeScript, React, Express, PostgreSQL",
    gitExperience: "basics",
    personalPageUrl: "https://eman.github.io",
    githubRepoUrl: "https://github.com/eman123/my-repo",
    aiUsage: "I have used AI tools for code generation and debugging.",
    motivation:
      "I want to join the cohort to enhance my skills and contribute to real-world projects.",
  };

  beforeEach(() => {
    service = new ApplicationsService();
  });

  it("application created successfully", async () => {
    const res = await service.apply("cohort-1", applyCohortDtoMocked);
    expect(res).toHaveProperty("id");
    expect(res.id.startsWith("app_")).toBe(true);
    expect(res.status).toBe("received");
  });

  it("should throw ConflictError if email already exists in the same cohort", async () => {
    await service.apply("cohort-1", applyCohortDtoMocked);
    const applyCohortDtoMockedSameEmail: ApplyCohortDto = {
      ...applyCohortDtoMocked,
      email: applyCohortDtoMocked.email.toUpperCase(),
      githubHandle: "eman456",
    };
    await expect(
      service.apply("cohort-1", applyCohortDtoMockedSameEmail),
    ).rejects.toThrow(ConflictError);
  });

  it("should throw ConflictError if githubHandle already exists in the same cohort", async () => {
    await service.apply("cohort-1", applyCohortDtoMocked);
    const applyCohortDtoMockedSameGithubHandle: ApplyCohortDto = {
      ...applyCohortDtoMocked,
      githubHandle: applyCohortDtoMocked.githubHandle.toUpperCase(),
      email: "fake@example.com",
    };
    await expect(
      service.apply("cohort-1", applyCohortDtoMockedSameGithubHandle),
    ).rejects.toThrow(ConflictError);
  });

  it("should allow same githubHandle in different cohorts", async () => {
    await service.apply("cohort-1", applyCohortDtoMocked);
    const res = await service.apply("cohort-2", applyCohortDtoMocked);
    expect(res).toHaveProperty("id");
    expect(res.id.startsWith("app_")).toBe(true);
    expect(res.status).toBe("received");
  });

  it("should reset applications", async () => {
    await service.apply("cohort-1", applyCohortDtoMocked);
    service.reset();
    const res = await service.findByCohort("cohort-1");
    expect(res.length).toBe(0);
  });
});

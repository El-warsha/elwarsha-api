import { ConflictError } from "../../common/errors.js";
import { ApplicationsService } from "./applications.service.js";
import { ApplyCohortDto } from "./dto/apply-cohort.dto.js";
import { describe, beforeEach } from "vitest";

function makeDto(overrides: Partial<ApplyCohortDto> = {}): ApplyCohortDto {
  return {
    fullName: "Sara Mahmoud",
    email: "sara@example.com",
    whatsappNumber: "+201012345678",
    githubHandle: "sara-dev",
    discordHandle: "sara_dev",
    currentStatus: "student",
    collegeMajor: "Faculty of Computer Science - CS Department",
    programmingExperience: "1.5 years",
    technologies: "JavaScript, TypeScript, React, Express",
    gitExperience: "basics",
    personalPageUrl: "https://sara-dev.github.io",
    githubRepoUrl: "https://github.com/sara-dev/my-page",
    aiUsage: "Used Cursor for autocompletion and Claude for debugging.",
    motivation:
      "I want to join ElWarsha Cohort 2 because I want to learn real-world full-stack development through practical vertical slices and code reviews.",
    ...overrides,
  };
}

describe("ApplicationService", () => {
  let applicationService: ApplicationsService;
  beforeEach(() => {
    applicationService = new ApplicationsService();
  });

  // test for cohortApplication and status received
  it('application returns a receipt with an app_ id and status: "received"', async () => {
    const receipt = await applicationService.apply("cohort-1", makeDto());
    expect(receipt).toBeDefined();
    expect(receipt.id).toMatch(/^app_/);

    expect(receipt.status).toBe("received");
    expect(receipt.cohortSlug).toBe("cohort-1");
  });

  // test for duplicate email in different letter case
  it("duplicate email in different letter case rejects with ConflictError", async () => {
   await applicationService.apply("cohort-1",makeDto({email: "sara@example.com",}));
    
    await expect(applicationService.apply("cohort-1",makeDto({email: 'SARA@example.com',githubHandle:'other-handle'}))).rejects.toThrow(ConflictError)


  });

    // test for duplicate GitHub handle with a different email rejects
  it("duplicate GitHub handle with a different email rejects", async () => {
   await applicationService.apply("cohort-1",makeDto());
    await expect(applicationService.apply("cohort-1",makeDto({email: 'other@example.com'}))).rejects.toThrow(ConflictError)

  });

      // test for the same applicant in a different cohort is accepted
  it("the same applicant in a different cohort is accepted", async () => {
  const receipt1= await applicationService.apply("cohort-1",makeDto());
  const receipt2= await applicationService.apply("cohort-2",makeDto());

     expect(receipt2.status).toBe('received')

  });

        // test for reset() clears state
  it("reset() clears state", async () => {
const cohort1=await applicationService.apply('cohort-1',makeDto())
expect((await applicationService.findByCohort('cohort-1'))).toHaveLength(1)

   await applicationService.reset();
expect((await applicationService.findByCohort('cohort-1'))).toHaveLength(0)
  });
});

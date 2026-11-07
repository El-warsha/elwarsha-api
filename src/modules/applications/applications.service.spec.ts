import { ConflictError } from "../../common/errors.js";
import { ApplicationsService } from "./applications.service.js";
import { ApplyCohortDto } from "./dto/apply-cohort.dto.js";


describe('ApplicationsService', () => {
  let service: ApplicationsService;
const validDto: ApplyCohortDto = {
  fullName: "Ahillah Mohamed",
  email: "ahillah871@gmail.com",
  whatsappNumber: "+201025990286",
  githubHandle: "ahillah",
  discordHandle: "ahillah_dev",
  currentStatus: "recent_graduate",
  collegeMajor: "Computer Engineering",
  programmingExperience: "2 years",
  technologies: "JavaScript, TypeScript, React, NestJS",
  gitExperience: "basics",
  personalPageUrl: "https://example.com",
  githubRepoUrl: "https://github.com/ahillah/my-page",
  aiUsage: "Used AI tools for debugging and code suggestions.",
  motivation:
    "I want to join this cohort to improve my software engineering skills through practical projects.",
};
  beforeEach(()=>
{
    service= new ApplicationsService();
});

it("should return a receipt for a valid application",async () => {
  const result= await service.apply('cohort-01', validDto);
 expect(result.id).toMatch(/^app_[a-f0-9]{8}$/);
  expect(result.cohortSlug).toBe("cohort-01");
  expect(result.email).toBe(validDto.email);
  expect(result.status).toBe("received");


  expect(new Date(result.createdAt).toISOString()).toBe(result.createdAt);


  expect(Object.keys(result).sort()).toEqual(
    ["id", "cohortSlug", "email", "status", "createdAt"].sort(),
  );
});
it("should reject an application with a duplicate email regardless of letter case", async () => {

  await service.apply('cohort-01', validDto);
 
  const duplicateDto = {
    ...validDto,
    email: "Ahillah871@gmail.com",
    githubHandle: "different-user",
  };

  await expect(service.apply('cohort-01', duplicateDto)).rejects.toThrow(ConflictError);
  // ai suggesion:
  const applications = await service.findByCohort("cohort-01");

expect(applications).toHaveLength(1);
});

it("should reject an application with a duplicate github handle regardless of letter case", async () => {

  await service.apply('cohort-01', validDto);
 
  const duplicateDto = {
    ...validDto,
    email: "ahillah872@gmail.com",
    githubHandle: "AHILLAH"
  };

  await expect(service.apply('cohort-01', duplicateDto)).rejects.toThrow(ConflictError);

   // ai suggesion:
  const applications = await service.findByCohort("cohort-01");

expect(applications).toHaveLength(1);
});

it("should allow the same applicant to apply to a different cohort", async () => {
  await service.apply("cohort-01", validDto);
  await service.apply("cohort-02", validDto);

  const firstCohortApplications = await service.findByCohort("cohort-01");
  const secondCohortApplications = await service.findByCohort("cohort-02");

  expect(firstCohortApplications).toHaveLength(1);
  expect(secondCohortApplications).toHaveLength(1);

  expect(firstCohortApplications[0].email).toBe(validDto.email);
  expect(secondCohortApplications[0].email).toBe(validDto.email);
});

it("should clear all applications when reset is called", async () => {
  await service.apply("cohort-01", validDto);
  const beforeReset = await service.findByCohort("cohort-01");
 expect(beforeReset).toHaveLength(1);

  service.reset();

  const afterReset = await service.findByCohort("cohort-01");
  expect(afterReset).toHaveLength(0);
    
});

it("should normalize email and GitHub handle before saving", async () => {
  const dto = {
    ...validDto,
    email: "  Ahillah@Example.com  ",
    githubHandle: "  Ahillah  ",
  };

  const result = await service.apply("cohort-01", dto);

  expect(result.email).toBe("ahillah@example.com");

  const applications = await service.findByCohort("cohort-01");

  expect(applications[0].githubHandle).toBe("ahillah");
});

it("should allow different applicants to apply to the same cohort", async () => {
  await service.apply("cohort-01", validDto);

  const anotherApplicantDto = {
    ...validDto,
    email: "another@applicant.com",
    githubHandle: "another-applicant",
  };
  await service.apply("cohort-01", anotherApplicantDto);
  const applications = await service.findByCohort("cohort-01");

  expect(applications).toHaveLength(2);

  });

  it("should return only applications belonging to the requested cohort", async () => {
  await service.apply("cohort-01", validDto);

  const secondApplicant = {
    ...validDto,
    email: "another@example.com",
    githubHandle: "another-user",
  };

  await service.apply("cohort-01", secondApplicant);

  const thirdApplicant = {
    ...validDto,
    email: "third@example.com",
    githubHandle: "third-user",
  };

  await service.apply("cohort-02", thirdApplicant);

  const applications = await service.findByCohort("cohort-01");

  expect(applications).toHaveLength(2);
  expect(applications.every(app => app.cohortSlug === "cohort-01")).toBe(true);
});

});
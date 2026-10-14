
import { ApplicationsService } from "./applications.service.js";
import {
    ApplyCohortDto,
    CurrentStatus,
    GitExperience,
} from "./dto/apply-cohort.dto.js";
import { DuplicateApplicationError } from "../../common/errors.js";

describe("ApplicationsService", () => {
    let service: ApplicationsService;

    beforeEach(() => {
        service = new ApplicationsService();
    });

    it("should create an application successfully", () => {
        const dto = createApplicationDto();

        const result = service.apply("cohort-2", dto);

        expect(result).toMatchObject({
            cohortSlug: "cohort-2",
            email: "sara@example.com",
            status: "received",
        });

        expect(result.id).toMatch(/^app_/);
        expect(Number.isNaN(Date.parse(result.createdAt))).toBe(false);
    });

    it("should reject a duplicate email", () => {
        service.apply("cohort-2", createApplicationDto());

        expect(() =>
            service.apply("cohort-2", {
                ...createApplicationDto(),
                email: "SARA@example.com",
                githubHandle: "another-user",
            }),
        ).toThrow(DuplicateApplicationError);
    });

    it("should reject a duplicate GitHub username", () => {
        service.apply("cohort-2", createApplicationDto());

        expect(() =>
            service.apply("cohort-2", {
                ...createApplicationDto(),
                email: "another@example.com",
                githubHandle: "SARA-AHMED",
            }),
        ).toThrow(DuplicateApplicationError);
    });

    it("should allow the same email in a different cohort", () => {
        const dto = createApplicationDto();

        service.apply("cohort-2", dto);

        const result = service.apply("cohort-3", {
            ...dto,
            githubHandle: "sara-ahmed-2",
        });

        expect(result.cohortSlug).toBe("cohort-3");
        expect(result.email).toBe(dto.email);
    });

    it("should normalize email and GitHub username", () => {
        const result = service.apply("cohort-2", {
            ...createApplicationDto(),
            email: "  SARA@EXAMPLE.COM  ",
            githubHandle: "  SARA-AHMED  ",
        });

        expect(result.email).toBe("sara@example.com");

        expect(() =>
            service.apply("cohort-2", {
                ...createApplicationDto(),
                email: "another@example.com",
                githubHandle: "sara-ahmed",
            }),
        ).toThrow(DuplicateApplicationError);
    });
});

function createApplicationDto(): ApplyCohortDto {
    return {
        fullName: "Sara Ahmed",
        email: "sara@example.com",
        whatsappNumber: "+201001234567",
        githubHandle: "sara-ahmed",
        discordHandle: "sara#1234",
        currentStatus: CurrentStatus.Student,
        collegeMajor: "Computer Engineering",
        programmingExperience: "Experience with C#",
        technologies: "C#, ASP.NET Core",
        gitExperience: GitExperience.Comfortable,
        personalPageUrl: "https://example.com",
        githubRepoUrl: "https://github.com/sara-ahmed/test-project",
        aiUsage: "I use AI to understand concepts",
        motivation: "I want to improve my backend skills",
    };
}

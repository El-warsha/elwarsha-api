import { ConflictError } from "../../common/errors.js";
import { ApplicationsService } from "./applications.service.js"
import { ApplyCohortDto } from "./dto/apply-cohort.dto.js";

describe("ApplicationsService", () => {
    let service: ApplicationsService;
    const validDto: ApplyCohortDto = {
        fullName: "Sara Mohamed",
        email: " Sara@Gmail.com ",
        whatsappNumber: "+201012345678",
        githubHandle: " SaraDev ",
        discordHandle: "sara_dev",
        currentStatus: "recent_graduate",
        collegeMajor: "Computer Engineering",
        programmingExperience: "2 years",
        technologies: "JavaScript, TypeScript, React",
        gitExperience: "comfortable",
        personalPageUrl: "https://sara.github.io",
        githubRepoUrl: "https://github.com/sara/my-page",
        aiUsage: "Used AI tools for debugging and suggestions.",
        motivation:
            "I want to join ElWarsha to improve my development skills through practical projects and code reviews.",
    };


    beforeEach(() => {
        service = new ApplicationsService();
    })

    it("A valid application returns a receipt with an app_ id and received status", async () => {
    const result = await service.apply("cohort-1", validDto);

    expect(result.id).toMatch(/^app_/);

    expect(result.status).toBe("received");
});


    it(" A newly stored record has lowercased, trimmed email and GitHub handle", async () => {

        await service.apply("cohort-1", validDto);
        const applications = await service.findByCohort('cohort-1');
        expect(applications[0].email).toBe("sara@gmail.com");
        expect(applications[0].githubHandle).toBe("saradev")
    })

    it("A same-cohort email duplicate is rejected despite different casing and a different GitHub handle", async () => {

        await service.apply("cohort-1", validDto);

        const secondApply = {
            ...validDto,
            email: "SAra@gmail.com",
            githubHandle: "anotherDev",
        }

        await expect(service.apply('cohort-1', secondApply)).rejects.toThrow(ConflictError)
    })

    it("A same-cohort GitHub duplicate is rejected despite different casing and a different email", async () => {

        await service.apply("cohort-1", validDto);

        const secondApply = {
            ...validDto,
            email: "sara123@gmail.com",
            githubHandle: 'SARADEV'
        }

        await expect(service.apply('cohort-1', secondApply)).rejects.toThrow(ConflictError)

    })

    it("The same email is allowed for a different cohort", async () => {
        const applicationCohort1 = await service.apply('cohort-1', validDto);
        const applicationCohort2 = await service.apply('cohort-2', validDto);

        expect(applicationCohort1.cohortSlug).toBe('cohort-1');
        expect(applicationCohort2.cohortSlug).toBe('cohort-2');
        expect(applicationCohort1.email).toBe(applicationCohort2.email)

    })


    it("findByCohort() returns only records for the requested cohort", async () => {
        await service.apply("cohort-1", validDto);

        await service.apply("cohort-2", {
            ...validDto,
            email: "another@gmail.com",
            githubHandle: "anotherDev",
        });

        const applications = await service.findByCohort("cohort-1");

        expect(applications).toHaveLength(1);
        expect(applications.every((app) => app.cohortSlug === "cohort-1")).toBe(true);

    })

    it("reset() clears the in-memory records", async () => {
        await service.apply('cohort-1', validDto);
        service.reset();
        const applications = await service.findByCohort('cohort-1');
        expect(applications.length).toBe(0)
    })
})
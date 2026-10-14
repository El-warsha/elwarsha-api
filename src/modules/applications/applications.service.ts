import { Injectable } from "@nestjs/common";
import { ApplyCohortDto } from "./dto/apply-cohort.dto.js";
import { ApplicationReceiptDto } from "./dto/application-receipt.dto.js";
import { DuplicateApplicationError } from "../../common/errors.js";
import { randomUUID } from "crypto";


interface StoredApplication extends ApplyCohortDto {
    id: string;
    cohortSlug: string;
    createdAt: string;
}

@Injectable()
export class ApplicationsService {
    private readonly applications = new Map<string, StoredApplication[]>();
    apply(cohortSlug: string,
        dto: ApplyCohortDto,): ApplicationReceiptDto {

        const applications = this.applications.get(cohortSlug) ?? [];
        const email = dto.email.trim().toLowerCase();
        const githubHandle = dto.githubHandle.trim().toLowerCase();

        const isDuplicate = applications.some(
            (a) => a.email === email || a.githubHandle === githubHandle,
        );

        if (isDuplicate)
            throw new DuplicateApplicationError();

        const application: StoredApplication = {
            ...dto,
            email,
            githubHandle,
            id: `app_${randomUUID()}`,
            cohortSlug,
            createdAt: new Date().toISOString(),
        };
        applications.push(application);
        this.applications.set(cohortSlug, applications);

        return {
            id: application.id,
            cohortSlug: application.cohortSlug,
            email: application.email,
            status: "received",
            createdAt: application.createdAt,
        };

    }
}
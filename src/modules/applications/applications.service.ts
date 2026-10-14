import { Injectable } from "@nestjs/common";
import { ApplyCohortDto } from "./dto/apply-cohort.dto.js";
import { DuplicateApplicationError } from "../../common/errors.js";
import { randomUUID } from "node:crypto";

type ApplicationReceipt = {
    id: string;
    cohortSlug: string;
    email: string;
    status: 'received';
    createdAt: string;

};

type StoredApplication = ApplyCohortDto & {
    id: string;
    cohortSlug: string;
    status: 'received';
    createdAt: string;

}

@Injectable()
export class ApplicationsService {
    private readonly applications: StoredApplication[] = [];

    apply(applicationData: ApplyCohortDto) {
        const existingApplication = this.applications.find((application) =>
            application.cohortSlug === 'cohort-2' && (
                application.email === applicationData.email ||
                application.githubHandle === applicationData.githubHandle
            )
        )

        if (existingApplication) {
            throw new DuplicateApplicationError();
        }

        const application: StoredApplication = {
            ...applicationData,
            id: `app_${randomUUID()}`,
            cohortSlug: "cohort-2",
            status: "received",
            createdAt: new Date().toISOString(),
        };

        this.applications.push(application);

        const receipt: ApplicationReceipt = {
            id: application.id,
            cohortSlug: application.cohortSlug,
            email: application.email,
            status: application.status,
            createdAt: application.createdAt,
        };

        return receipt;

    }

}
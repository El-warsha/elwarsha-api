import { Injectable } from "@nestjs/common";
import { DuplicateApplicationError } from "../../common/errors.js";
import { applyCohort } from "./dto/apply-cohort.dto.js";

export type ApplicationResponse = {
  id: string;
  cohortSlug: string;
  email: string;
  status: "received";
  createdAt: string;
};

export type StoredApplication = applyCohort & ApplicationResponse;

@Injectable()
export class ApplicationsService {
  applicationsStore: StoredApplication[] = [];
  private counter = 123456;

  addApplication(
    slug: string,
    applicantData: applyCohort,
  ): ApplicationResponse {
    const cohortTitle =
      slug === "cohort-2"
        ? "Cohort 2"
        : slug
            .split("-")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" ");

    const duplicate = this.applicationsStore.find(
      (applicant) =>
        applicant.cohortSlug === slug &&
        (applicant.email === applicantData.email ||
          applicant.githubHandle === applicantData.githubHandle),
    );

    if (duplicate) {
      throw new DuplicateApplicationError(
        `An application with this email or GitHub handle already exists for ${cohortTitle}`,
      );
    }

    const id = `app_${this.counter++}`;
    const newApplication: StoredApplication = {
      ...applicantData,
      id,
      cohortSlug: slug,
      status: "received",
      createdAt: new Date().toISOString(),
    };

    this.applicationsStore.push(newApplication);

    return {
      id: newApplication.id,
      cohortSlug: newApplication.cohortSlug,
      email: newApplication.email,
      status: newApplication.status,
      createdAt: newApplication.createdAt,
    };
  }
}
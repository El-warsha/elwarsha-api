import { ConflictException, Injectable } from "@nestjs/common";
import { CreateApplicationDto } from "./dto/apply-cohort.dto.js";
import { Applications } from "../../domain/models.js";
import { randomUUID } from "node:crypto";
@Injectable()
export class ApplicationsService {
  private applications: Applications[] = [];
  create(slug: string, createApplicationDto: CreateApplicationDto) {
    const cohortApps = this.applications.filter((app) => app.slug === slug);
    const emailFound = cohortApps.some(
      (cohortApp) => cohortApp.email === createApplicationDto.email,
    );
    const githubFound = cohortApps.some(
      (cohortApp) => cohortApp.githubHandle === createApplicationDto.githubHandle,
    );

    if (emailFound || githubFound) {
      throw new ConflictException();
    }
    const id =randomUUID();
    const createdAt = Date.now().toLocaleString();
    const newApp = { ...createApplicationDto, slug, id, createdAt };
    this.applications.push(newApp);

    const receipt = {
      id,
    cohortSlug:slug,
      email: createApplicationDto.email,
      status: "received",

      createdAt,
    };
    return receipt;
  }
}

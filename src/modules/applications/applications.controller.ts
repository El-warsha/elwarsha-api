import { Controller, Post, Body, Param } from "@nestjs/common";
import { ApplicationsService } from "./applications.service.js";
import { CreateApplicationDto } from "./dto/apply-cohort.dto.js";

@Controller("api/v1/cohorts/:slug/applications")
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(
    @Param("slug") slug: string,

    @Body() createApplicationDto: CreateApplicationDto,
  ) {
    return this.applicationsService.create(slug, createApplicationDto);
  }
}

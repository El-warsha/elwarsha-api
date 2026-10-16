import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { ApplicationsService } from "./applications.service.js";
import { ApplyCohortDto } from "./dto/apply-cohort.dto.js";

@ApiTags("applications")
@Controller("api/v1/cohorts/:slug/applications")
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Apply for a cohort" })
  @ApiResponse({ status: 201, description: "Application received" })
  @ApiResponse({ status: 409, description: "Duplicate application" })
  @ApiResponse({ status: 422, description: "Validation failed" })
  apply(@Param("slug") slug: string, @Body() dto: ApplyCohortDto) {
    return this.applications.apply(slug, dto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an application by id" })
  @ApiResponse({ status: 200, description: "Application found" })
  @ApiResponse({ status: 404, description: "Application not found" })
  getById(@Param("id") id: string) {
    return this.applications.getById(id);
  }
}

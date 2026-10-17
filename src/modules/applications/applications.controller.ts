import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import type { ApplicationReceipt } from "./applications.service.js";
import { ApplicationsService } from "./applications.service.js";
import { CreateApplicationDto } from "./dto/apply-cohort.dto.js";

@ApiTags("cohorts")
@Controller("api/v1/cohorts")
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post(":slug/applications")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Submit an application for a cohort" })
  @ApiParam({
    name: "slug",
    description: "The cohort slug (e.g. cohort-2)",
    example: "cohort-2",
  })
  @ApiBody({ type: CreateApplicationDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Application successfully submitted",
    schema: {
      example: {
        id: "app_123456",
        cohortSlug: "cohort-2",
        email: "student@example.com",
        status: "received",
        createdAt: "2026-10-10T12:00:00.000Z",
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "Duplicate application (email or GitHub handle already submitted)",
    schema: {
      example: {
        type: "https://elwarsha.dev/errors/duplicate-application",
        title: "Application Already Submitted",
        status: 409,
        detail:
          "An application with this email or GitHub handle already exists for Cohort 2",
        instance: "/api/v1/cohorts/cohort-2/applications",
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: "Validation failed",
    schema: {
      example: {
        type: "https://elwarsha.dev/errors/validation-failed",
        title: "Validation Failed",
        status: 422,
        detail: "Some fields have invalid values",
        instance: "/api/v1/cohorts/cohort-2/applications",
        invalidParams: [
          { name: "email", reason: "Must be a valid email address" },
          { name: "motivation", reason: "Must be at least 50 characters" },
        ],
      },
    },
  })
  createApplication(
    @Param("slug") slug: string,
    @Body() dto: CreateApplicationDto,
  ): ApplicationReceipt {
    return this.applicationsService.createApplication(slug, dto);
  }
}

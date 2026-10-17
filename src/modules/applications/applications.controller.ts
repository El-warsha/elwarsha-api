import { Body, Controller, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { ApplicationsService } from "./applications.service.js";
import { ApplyCohortDto } from "./dto/apply-cohort.dto.js";

@ApiTags("cohorts")
@Controller("api/v1/cohorts")
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post(":slug/applications")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Submit an application to join a cohort" })
  @ApiParam({
    name: "slug",
    description: "The cohort slug (e.g. cohort-2)",
    example: "cohort-2",
  })
  @ApiResponse({
    status: 201,
    description: "Application successfully received",
    schema: {
      type: "object",
      properties: {
        id: { type: "string", example: "app_7b2f1e9a" },
        cohortSlug: { type: "string", example: "cohort-2" },
        email: { type: "string", example: "ahmed@example.com" },
        status: { type: "string", example: "received" },
        createdAt: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: "Application already submitted with this email or GitHub handle",
  })
  @ApiResponse({
    status: 422,
    description: "Validation failed with structured invalidParams list",
  })
  async apply(@Param("slug") slug: string, @Body() dto: ApplyCohortDto) {
    return this.applicationsService.apply(slug, dto);
  }
}

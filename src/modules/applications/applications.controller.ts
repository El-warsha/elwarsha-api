import { Controller, Post, Body, Param } from "@nestjs/common";
import { ApplicationsService } from "./applications.service.js";
import { CreateApplicationDto } from "./dto/apply-cohort.dto.js";
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";

@Controller("api/v1/cohorts/:slug/applications")
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @ApiOperation({
    summary: "Submit a cohort application",
    description: "Submit an application to a cohort identified by its slug.",
  })
  @ApiParam({
    name: "slug",
    description: "Unique slug of the cohort",
    example: "cohort-2",
    type:String,
  })
  @ApiCreatedResponse({
    description: "Application submitted successfully",
  })
  @ApiConflictResponse({
    description: "Email or GitHub handle already exists in this cohort",
  })
  @ApiUnprocessableEntityResponse({
    description: "Request validation failed",
  })
  @ApiBody({ type: CreateApplicationDto })
  @Post()
  create(
    @Param("slug") slug: string,

    @Body() createApplicationDto: CreateApplicationDto,
  ) {
    return this.applicationsService.create(slug, createApplicationDto);
  }
}

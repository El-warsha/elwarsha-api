  import { Controller, Post, Body, Param } from '@nestjs/common';
  import { ApplicationService } from './applications.service.js';
  import { ApplyCohortDto } from './dto/apply-cohort.dto.js';
  import { ApiTags } from '@nestjs/swagger';

  @ApiTags("applications")
  @Controller("api/v1")
  export class ApplicationController {
    constructor(private readonly applicationService: ApplicationService) { }

    @Post("cohorts/:slug/applications")
    apply(@Body() body: ApplyCohortDto, @Param("slug") slug: string) {
      return this.applicationService.applyCohort(body, slug);
    }
  }

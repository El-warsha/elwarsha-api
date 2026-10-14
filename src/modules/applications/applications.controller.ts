import { Body, Controller, HttpStatus, Param, Post } from "@nestjs/common";
import { ApplicationsService } from "./applications.service.js";

import { ApplyCohortDto } from "./dto/apply-cohort.dto.js";


@Controller("api/v1/cohorts")
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) {
    }
    @Post(":slug/applications")
    apply(
        @Param("slug") slug: string,
        @Body() dto: ApplyCohortDto,
    ) {
        return this.applicationsService.apply(slug, dto);
    }
}
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApplicationsService } from './applications.service.js';
import { ApplyCohortDto } from './apply-cohort.dto.js';


@Controller('api/v1/cohorts')
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) {}

    @Post('cohort-2/applications')
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: ApplyCohortDto) {
        return this.applicationsService.create(dto);
    }
}
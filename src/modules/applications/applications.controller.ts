import { ApplicationsService } from './applications.service.js';
import { Body, Controller, Post } from "@nestjs/common";
import { ApplyCohortDto } from "./dto/apply-cohort.dto.js";



@Controller("api/v1/cohorts/cohort-2/applications")
export class ApplicationsController{
    constructor(private readonly applicationsService: ApplicationsService){}

    @Post()
    apply(@Body() applicationData:ApplyCohortDto){
        return this.applicationsService.apply(applicationData)
    }

}
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UsePipes,
} from "@nestjs/common";
import { ValidationPipe } from "../../common/validation.pipe.js";
import {
  type ApplicationResponse,
  ApplicationsService,
} from "./applications.service.js";
import { applyCohort } from "./dto/apply-cohort.dto.js";

@Controller("api/v1/cohorts/:slug/applications")
@UsePipes(new ValidationPipe())
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  addApplication(
    @Param("slug") slug: string,
    @Body() applicantData: applyCohort,
  ): ApplicationResponse {
    return this.applicationsService.addApplication(slug, applicantData);
  }
}

export default ApplicationsController;
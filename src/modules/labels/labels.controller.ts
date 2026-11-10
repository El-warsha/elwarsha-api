import { Controller, Get, UseGuards } from '@nestjs/common';
import { LabelsService } from './labels.service.js';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard, RequireCapability } from '../identity/auth.guard.js';

@ApiTags("labels")

@Controller("api/v1")
@UseGuards(AuthGuard)

export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}


  @Get('labels')
  @RequireCapability("assignments.read")

 listLabels() {
    return this.labelsService.listLabels();

}
}
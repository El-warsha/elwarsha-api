import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../identity/auth.guard.js';
import { LabelsService } from './labels.service.js';

@Controller('api/v1/labels')
@UseGuards(AuthGuard)
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Get()
  async listLabels() {
    return this.labelsService.findAll();
  }
}
import { Module } from '@nestjs/common';
import { ApplicationService } from './applications.service.js';
import { ApplicationController } from './applications.controller.js';
import { ApplyCohortDto } from './dto/apply-cohort.dto.js';

@Module({
  controllers: [ApplicationController],
  providers: [ApplicationService, ApplyCohortDto],
})
export class ApplicationModule {}

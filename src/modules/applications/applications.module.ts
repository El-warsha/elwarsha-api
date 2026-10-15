import { Module } from '@nestjs/common';
import { ApplicationService } from './applications.service.js';
import { ApplicationController } from './applications.controller.js';

@Module({
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule {}

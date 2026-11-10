import { Module } from '@nestjs/common';
import { LabelsService } from './labels.service.js';
import { LabelsController } from './labels.controller.js';
import { LabelsRepository } from './labels.repository.js';
import { IdentityModule } from '../identity/identity.module.js';

@Module({
    imports: [IdentityModule],

  controllers: [LabelsController],
  providers: [LabelsService,LabelsRepository],
  exports:[LabelsService]
})
export class LabelsModule {}

import { Module } from "@nestjs/common";

import { IdentityModule } from "../identity/identity.module.js";
import { LabelsController } from "./labels.controller.js";
import { LabelsRepository } from "./labels.repository.js";
import { LabelsService } from "./labels.service.js";

@Module({
  imports: [IdentityModule],
  controllers: [LabelsController],
  providers: [LabelsRepository, LabelsService],
  exports: [LabelsService],
})
export class LabelsModule {}

import { Module } from "@nestjs/common";

import { LabelsRepository } from "./labels.repository.js";
import { LabelsService } from "./labels.service.js";

@Module({
  providers: [LabelsRepository, LabelsService],
  exports: [LabelsService],
})
export class LabelsModule {}

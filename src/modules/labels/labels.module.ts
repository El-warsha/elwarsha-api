import { Module } from "@nestjs/common";

import { PrismaLabelsRepository } from "../../infrastructure/labels/prisma-labels.repository.js";
import { IdentityModule } from "../identity/identity.module.js";
import { LABELS_REPOSITORY } from "./labels.repository.js";
import { LabelsController } from "./labels.controller.js";
import { LabelsService } from "./labels.service.js";

@Module({
  imports: [IdentityModule],
  controllers: [LabelsController],
  providers: [
    LabelsService,
    PrismaLabelsRepository,
    {
      provide: LABELS_REPOSITORY,
      useExisting: PrismaLabelsRepository,
    },
  ],
  exports: [LabelsService],
})
export class LabelsModule {}

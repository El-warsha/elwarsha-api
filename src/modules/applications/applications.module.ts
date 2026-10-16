import { Module } from "@nestjs/common";

import { PrismaModule } from "../../infrastructure/prisma/prisma.module.js";
import { ApplicationsController } from "./applications.controller.js";
import { ApplicationsRepository } from "./applications.repository.js";
import { ApplicationsService } from "./applications.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, ApplicationsRepository],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}

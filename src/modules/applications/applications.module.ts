import { Module } from "@nestjs/common";

import { IdentityModule } from "../identity/identity.module.js";
import { ApplicationsController } from "./applications.controller.js";
import { ApplicationsService } from "./applications.service.js";

@Module({
  imports: [IdentityModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}

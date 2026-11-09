import { Module } from "@nestjs/common";

import { PrismaModule } from "../../infrastructure/prisma/prisma.module.js";
import { IdentityModule } from "../identity/identity.module.js";
import { CohortMembershipGuard } from "./cohort-membership.guard.js";
import { WeeksController } from "./weeks.controller.js";
import { WeeksService } from "./weeks.service.js";
import { IdentityModule } from "../identity/identity.module.js";

@Module({
  imports: [PrismaModule, IdentityModule],
  controllers: [WeeksController],
  providers: [WeeksService, CohortMembershipGuard],
  exports: [WeeksService, CohortMembershipGuard],
})
export class WeeksModule {}

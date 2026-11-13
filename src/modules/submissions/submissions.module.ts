
import { Module } from "@nestjs/common";

import { PrismaModule } from "../../infrastructure/prisma/prisma.module.js";
import { IdentityModule } from "../identity/identity.module.js";
import { WeeksModule } from "../weeks/weeks.module.js";
import { GithubModule } from "../github/github.module.js";

import { SubmissionsController } from "./submissions.controller.js";
import { SubmissionsService } from "./submissions.service.js";

@Module({
  imports: [
    PrismaModule,
    IdentityModule,
    WeeksModule,
    GithubModule,
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
})
export class SubmissionsModule {}

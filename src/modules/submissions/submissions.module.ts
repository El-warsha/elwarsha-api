import { Module } from "@nestjs/common";

import { GithubModule } from "../github/github.module.js";
import { IdentityModule } from "../identity/identity.module.js";
import { WeeksModule } from "../weeks/weeks.module.js";
import { SubmissionsController } from "./submissions.controller.js";
import { SubmissionsRepository } from "./submissions.repository.js";
import { SubmissionsService } from "./submissions.service.js";

@Module({
  imports: [GithubModule, IdentityModule, WeeksModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsRepository, SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}

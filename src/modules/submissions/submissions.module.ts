import { Module } from "@nestjs/common";
import { SubmissionsService } from "./submissions.service.js";
import { SubmissionsController } from "./submissions.controller.js";
import { SubmissionsRepository } from "./submissions.repository.js";
import { GithubModule } from "../github/github.module.js";
import { IdentityModule } from "../identity/identity.module.js";

@Module({
  imports: [GithubModule, IdentityModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsRepository, SubmissionsService],
})
export class SubmissionsModule {}

import { Module } from "@nestjs/common";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module.js";
import { SubmissionsService } from "./submissions.service.js";
import { SubmissionsController } from "./submissions.controller.js";
import { GithubModule } from "../github/github.module.js";
import { IdentityModule } from "../identity/identity.module.js";
@Module({
  imports: [PrismaModule, IdentityModule, GithubModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}

import { Module } from "@nestjs/common";

import { AppConfigModule } from "./config/app-config.module.js";
import { JobModule } from "./infrastructure/jobs/job.module.js";
import { PrismaModule } from "./infrastructure/prisma/prisma.module.js";
import { GithubModule } from "./modules/github/github.module.js";

@Module({
  imports: [AppConfigModule, PrismaModule, JobModule, GithubModule],
})
export class WorkerModule {}

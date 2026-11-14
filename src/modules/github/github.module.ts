import { Module } from "@nestjs/common";

import type { AppEnv } from "../../config/env.js";
import { JobModule } from "../../infrastructure/jobs/job.module.js";
import { APP_ENV } from "../../config/tokens.js";
// import { FakeGithubAppClient } from "./fake-github.client.js";
import { GithubController } from "./github.controller.js";
import { GithubService } from "./github.service.js";
import { HttpGithubAppClient } from "./http-github.client.js";

@Module({
  imports: [JobModule],
  controllers: [GithubController],
  providers: [
    GithubService,
    {
      provide: "GithubAppClient",
      // useFactory: (env: AppEnv) => new FakeGithubAppClient(env),
      useFactory: (env: AppEnv) => new HttpGithubAppClient(env.GITHUB_TOKEN),
      inject: [APP_ENV],
    },
  ],
  // exports: [GithubService],
  exports: [GithubService, "GithubAppClient"],
})
export class GithubModule {}

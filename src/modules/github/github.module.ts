import { Module } from "@nestjs/common";

import type { AppEnv } from "../../config/env.js";
import { JobModule } from "../../infrastructure/jobs/job.module.js";
import { APP_ENV } from "../../config/tokens.js";
import { FakeGithubAppClient } from "./fake-github.client.js";
import { GithubController } from "./github.controller.js";
import { GithubService } from "./github.service.js";
import { HttpGithubAppClient } from "./http-github.client.js";
import { GITHUB_APP_CLIENT } from "./github.tokens.js";

@Module({
  imports: [JobModule],
  controllers: [GithubController],
  providers: [
    GithubService,
    {
      provide: GITHUB_APP_CLIENT,
      useFactory: (env: AppEnv) => {
   return (env.NODE_ENV === "test" || env.GITHUB_CLIENT_ADAPTER === "fake")?
      new FakeGithubAppClient(env): new HttpGithubAppClient(env);
      },
      inject: [APP_ENV],
    },
  ],
exports: [GithubService, GITHUB_APP_CLIENT],
})
export class GithubModule {}

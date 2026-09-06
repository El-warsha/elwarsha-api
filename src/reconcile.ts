import "reflect-metadata";

import { existsSync } from "node:fs";

import { NestFactory } from "@nestjs/core";

import { ConsoleLogger } from "./common/logger.js";
import { GithubService } from "./modules/github/github.service.js";
import { WorkerModule } from "./worker.module.js";

if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

async function main(): Promise<void> {
  const logger = new ConsoleLogger("info", { process: "reconcile" });
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ["error", "warn"],
  });
  await app.get(GithubService).enqueueReconciliation();
  logger.info("Reconciliation job enqueued");
  await app.close();
}

void main();

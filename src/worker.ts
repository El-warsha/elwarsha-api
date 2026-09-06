import "reflect-metadata";

import { existsSync } from "node:fs";

import { NestFactory } from "@nestjs/core";

import { ConsoleLogger } from "./common/logger.js";
import { loadEnv } from "./config/env.js";
import { JobService } from "./infrastructure/jobs/job.service.js";
import { GithubService } from "./modules/github/github.service.js";
import { WorkerModule } from "./worker.module.js";

if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

async function processOnce(
  jobs: JobService,
  github: GithubService,
  logger: ConsoleLogger,
): Promise<void> {
  const job = await jobs.claimNext();
  if (!job) {
    return;
  }

  try {
    if (job.type === "process_github_webhook") {
      const deliveryId = String(job.payload.deliveryId ?? "");
      await github.processDelivery(deliveryId);
    }
    if (job.type === "reconcile_pull_requests") {
      logger.info("Reconciliation requested", { jobId: job.id });
    }
    await jobs.complete(job.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown job error";
    logger.error("Job failed", { jobId: job.id, message });
    await jobs.fail(job.id, message);
  }
}

async function bootstrap(): Promise<void> {
  const env = loadEnv();
  const logger = new ConsoleLogger(env.LOG_LEVEL, { process: "worker" });
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ["error", "warn"],
  });
  const jobs = app.get(JobService);
  const github = app.get(GithubService);

  logger.info("Worker started");
  while (true) {
    await processOnce(jobs, github, logger);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

void bootstrap();

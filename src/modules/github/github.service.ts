import { Inject, Injectable } from "@nestjs/common";

import { UnauthorizedError } from "../../common/errors.js";
import { JobService } from "../../infrastructure/jobs/job.service.js";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import type { GithubAppClient } from "./github.ports.js";

@Injectable()
export class GithubService {
  constructor(
    @Inject("GithubAppClient") private readonly github: GithubAppClient,
    private readonly prisma: PrismaService,
    private readonly jobs: JobService,
  ) {}

  async acceptWebhook(
    rawBody: string,
    signature: string | undefined,
    deliveryId: string | undefined,
    eventType: string | undefined,
  ): Promise<{ accepted: boolean }> {
    if (!this.github.verifyWebhookSignature(rawBody, signature)) {
      throw new UnauthorizedError("Invalid GitHub webhook signature");
    }

    if (!deliveryId || !eventType) {
      throw new UnauthorizedError("Missing GitHub delivery headers");
    }

    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    await this.jobs.acceptWebhookDelivery(
      deliveryId,
      eventType,
      JSON.parse(JSON.stringify(payload)) as Record<string, unknown>,
    );

    return { accepted: true };
  }

  async processDelivery(deliveryId: string): Promise<void> {
    await this.prisma.githubWebhookDelivery.update({
      where: { id: deliveryId },
      data: { processingStatus: "processed" },
    });
  }

  async enqueueReconciliation(): Promise<void> {
    await this.jobs.enqueue("reconcile_pull_requests", {
      requestedAt: new Date().toISOString(),
    });
  }
}

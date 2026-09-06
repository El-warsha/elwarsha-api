import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";

import { PrismaService } from "../prisma/prisma.service.js";
import type { JobRecord, JobType } from "./job.types.js";

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}

  async acceptWebhookDelivery(
    deliveryId: string,
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const webhookId = randomUUID();
      const inserted = await tx.githubWebhookDelivery.createMany({
        data: [
          {
            id: webhookId,
            deliveryId,
            eventType,
            payload: payload as Prisma.InputJsonValue,
            processingStatus: "queued",
          },
        ],
        skipDuplicates: true,
      });

      if (inserted.count === 0) {
        return false;
      }

      await tx.job.create({
        data: {
          type: "process_github_webhook",
          payload: { deliveryId: webhookId, eventType },
          webhookId,
        },
      });
      return true;
    });
  }

  async enqueue(
    type: JobType,
    payload: Record<string, unknown>,
    webhookId?: string,
  ): Promise<JobRecord> {
    const job = await this.prisma.job.create({
      data: {
        type,
        payload: payload as Prisma.InputJsonValue,
        webhookId,
      },
    });

    return {
      id: job.id,
      type: job.type,
      payload: job.payload as Record<string, unknown>,
      attemptCount: job.attemptCount,
    };
  }

  async claimNext(now = new Date()): Promise<JobRecord | null> {
    const staleBefore = new Date(now.getTime() - 5 * 60 * 1000);
    const [claimed] = await this.prisma.$queryRaw<
      Array<{
        id: string;
        type: JobType;
        payload: Prisma.JsonValue;
        attemptCount: number;
      }>
    >`
      UPDATE "Job"
      SET
        "status" = 'processing'::"JobStatus",
        "attemptCount" = "attemptCount" + 1,
        "lockedAt" = ${now},
        "updatedAt" = ${now}
      WHERE "id" = (
        SELECT "id"
        FROM "Job"
        WHERE (
          ("status" = 'pending'::"JobStatus" AND "availableAt" <= ${now})
          OR (
            "status" = 'processing'::"JobStatus"
            AND COALESCE("lockedAt", "updatedAt") <= ${staleBefore}
          )
        )
        ORDER BY "createdAt" ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      RETURNING "id", "type", "payload", "attemptCount"
    `;

    if (!claimed) {
      return null;
    }

    return {
      id: claimed.id,
      type: claimed.type,
      payload: claimed.payload as Record<string, unknown>,
      attemptCount: claimed.attemptCount,
    };
  }

  async complete(id: string): Promise<void> {
    await this.prisma.job.update({
      where: { id },
      data: { status: "completed", lastError: null, lockedAt: null },
    });
  }

  async fail(id: string, error: string, retryDelayMs = 30_000): Promise<void> {
    await this.prisma.job.update({
      where: { id },
      data: {
        status: "pending",
        lastError: error,
        availableAt: new Date(Date.now() + retryDelayMs),
        lockedAt: null,
      },
    });
  }
}

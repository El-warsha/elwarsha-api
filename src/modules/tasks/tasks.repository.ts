import { Injectable } from "@nestjs/common";

import type { Assignment } from "../../domain/models.js";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}


  async listAssignments(): Promise<Assignment[]> {
    const records = await this.prisma.assignment.findMany({
      orderBy: [{ engagementId: "asc" }, { weekNumber: "asc" }],
    });

    return records.map((record) => ({
      id: record.id,
      weekNumber: record.weekNumber,
      title: record.title,
      status: record.status,
      engagementId: record.engagementId,
      labels: [],
    }));
  }
}

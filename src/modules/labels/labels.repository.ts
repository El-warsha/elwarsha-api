import { Injectable } from "@nestjs/common";

import type { Label } from "../../domain/models.js";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";

@Injectable()
export class LabelsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listLabels(): Promise<Label[]> {
    const records = await this.prisma.label.findMany({
      orderBy: { name: "asc" },
    });

    return records.map((record) => ({ id: record.id, name: record.name }));
  }

  async listByAssignmentIds(assignmentIds: string[]): Promise<Map<string, Label[]>> {
    const records = await this.prisma.assignmentLabel.findMany({
      where: { assignmentId: { in: assignmentIds } },
      include: { label: true },
      orderBy: { label: { name: "asc" } },
    });

    const byAssignment = new Map<string, Label[]>();
    for (const record of records) {
      const labels = byAssignment.get(record.assignmentId) ?? [];
      labels.push({ id: record.label.id, name: record.label.name });
      byAssignment.set(record.assignmentId, labels);
    }
    return byAssignment;
  }
}

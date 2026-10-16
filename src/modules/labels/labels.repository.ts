import { Injectable } from "@nestjs/common";

import type { Label } from "../../domain/models.js";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";

@Injectable()
export class LabelsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listForAssignments(assignmentIds: string[]): Promise<Map<string, Label[]>> {
    const records = await this.prisma.assignmentLabel.findMany({
      where: {
        assignmentId: { in: assignmentIds },
      },
      include: {
        label: true,
      },
    });

    const map = new Map<string, Label[]>();
    for (const record of records) {
      const existing = map.get(record.assignmentId) ?? [];
      existing.push({
        id: record.label.id,
        name: record.label.name,
      });
      map.set(record.assignmentId, existing);
    }

    return map;
  }
}

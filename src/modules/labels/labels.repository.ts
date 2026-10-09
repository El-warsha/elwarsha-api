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

    return records.map((record) => ({
      id: record.id,
      name: record.name,
    }));
  }

  async findLabelsByAssignmentIds(
    assignmentIds: string[],
  ): Promise<Map<string, Label[]>> {
    const records = await this.prisma.assignmentLabel.findMany({
      where: {
        assignmentId: { in: assignmentIds },
      },
      include: {
        label: true,
      },
      orderBy: {
        label: { name: "asc" },
      },
    });

    const labelMap = new Map<string, Label[]>();
    for (const id of assignmentIds) {
      labelMap.set(id, []);
    }

    for (const record of records) {
      labelMap.get(record.assignmentId)?.push({
        id: record.label.id,
        name: record.label.name,
      });
    }

    return labelMap;
  }
}

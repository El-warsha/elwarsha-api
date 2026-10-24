import { Injectable } from "@nestjs/common";

import type { Label } from "../../domain/models.js";
import type {
  AssignmentLabelRecord,
  LabelsRepository,
} from "../../modules/labels/labels.repository.js";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class PrismaLabelsRepository implements LabelsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listAll(): Promise<Label[]> {
    const records = await this.prisma.label.findMany({
      orderBy: { name: "asc" },
    });

    return records.map((record) => ({
      id: record.id,
      name: record.name,
    }));
  }

  async listForAssignments(assignmentIds: string[]): Promise<AssignmentLabelRecord[]> {
    if (assignmentIds.length === 0) return [];

    const records = await this.prisma.assignmentLabel.findMany({
      where: { assignmentId: { in: assignmentIds } },
      include: { label: true },
    });

    return records.map(({ assignmentId, label }) => ({
      assignmentId,
      label: {
        id: label.id,
        name: label.name,
      },
    }));
  }
}

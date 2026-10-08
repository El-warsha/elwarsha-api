import { Injectable } from "@nestjs/common";

import type { Label, AssignmentLabel } from "../../domain/models.js";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";

@Injectable()
export class LabelsRepository {
  constructor(private readonly prisma: PrismaService) {}

 async listAssignmentLabels() {
  const records = await this.prisma.assignmentLabel.findMany({
    include: {
      label: true,
    },
  });

  return records.map((record) => ({
    assignmentId: record.assignmentId,
    labelId: record.labelId,
    label: {
      id: record.label.id,
      name: record.label.name,
      createdAt: record.label.createdAt,
    },
  }));
}
}

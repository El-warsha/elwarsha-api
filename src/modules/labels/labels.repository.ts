import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import type { Label } from "../../domain/models.js";

@Injectable()
export class LabelsRepository {
     constructor(private readonly prisma: PrismaService) {} 
       async listLabels(): Promise<Label[]> {
    const records = await this.prisma.label.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return records.map((record) => ({
      id: record.id,
      name: record.name,
    }));
  }

    async getLabelById(id: string): Promise<Label | null> {
    const record = await this.prisma.label.findUnique({
      where: {
        id,
      },
    });

    if (!record) {
      return null;
    }

    return {
      id: record.id,
      name: record.name,
    };
  }
 async listLabelsByAssignmentIds(
    assignmentIds: string[],
  ) {
    const records = await this.prisma.assignmentLabel.findMany({
      where: {
        assignmentId: {
          in: assignmentIds,
        },
      },
      include: {
        label: true,
      },
    });

    return records;
  }

  
}


import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";

@Injectable()
export class LabelsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.label.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  async findByIds(ids: string[]) {
    return this.prisma.label.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}

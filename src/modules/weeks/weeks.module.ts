import { Module } from "@nestjs/common";

import { PrismaModule } from "../../infrastructure/prisma/prisma.module.js";
import { WeeksController } from "./weeks.controller.js";
import { WeeksService } from "./weeks.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [WeeksController],
  providers: [WeeksService],
  exports: [WeeksService],
})
export class WeeksModule {}

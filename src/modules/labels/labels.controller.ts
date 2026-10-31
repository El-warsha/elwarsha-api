import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { AuthGuard, RequireCapability } from "../identity/auth.guard.js";
import { LabelsService } from "./labels.service.js";

@ApiTags("labels")
@Controller("api/v1/labels")
@UseGuards(AuthGuard)
export class LabelsController {
  constructor(private readonly labels: LabelsService) {}

  @Get()
  @RequireCapability("assignments.read")
  listAll() {
    return this.labels.listAll();
  }
}

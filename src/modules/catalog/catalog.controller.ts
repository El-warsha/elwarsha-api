import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { AuthGuard, RequireCapability } from "../identity/auth.guard.js";
import { CatalogRepository } from "./catalog.repository.js";

@ApiTags("catalog")
@Controller("api/v1")
@UseGuards(AuthGuard)
export class CatalogController {
  constructor(private readonly catalog: CatalogRepository) {}

  @Get("products")
  @RequireCapability("products.read")
  listProducts() {
    return this.catalog.listProducts();
  }

  @Get("engagements")
  @RequireCapability("cohorts.read")
  listEngagements() {
    return this.catalog.listEngagements();
  }

  @Get("assignments")
  @RequireCapability("assignments.read")
  listAssignments() {
    return this.catalog.listAssignments();
  }
}

import { Module } from "@nestjs/common";

import { IdentityModule } from "../identity/identity.module.js";
import { CatalogController } from "./catalog.controller.js";
import { CatalogRepository } from "./catalog.repository.js";

@Module({
  imports: [IdentityModule],
  controllers: [CatalogController],
  providers: [CatalogRepository],
})
export class CatalogModule {}

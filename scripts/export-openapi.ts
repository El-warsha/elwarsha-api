import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { writeFileSync } from "node:fs";

import { AppModule } from "../src/app.module.js";

async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  const swagger = new DocumentBuilder()
    .setTitle("ElWarsha API")
    .setVersion("0.1.0")
    .build();
  const document = SwaggerModule.createDocument(app, swagger);
  writeFileSync("openapi.json", JSON.stringify(document, null, 2));
  await app.close();
}

void main();

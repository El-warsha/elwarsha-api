import "reflect-metadata";

import { existsSync } from "node:fs";

import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import type { Request } from "express";

import { AppModule } from "./app.module.js";
import { HttpExceptionFilter } from "./common/http-exception.filter.js";
import { ConsoleLogger } from "./common/logger.js";
import { loadEnv } from "./config/env.js";
import { UnprocessableEntityException, ValidationPipe } from "@nestjs/common";

if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

async function bootstrap(): Promise<void> {
  const env = loadEnv();
  const logger = new ConsoleLogger(env.LOG_LEVEL);
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn"],
    rawBody: true,
  });

  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
    origin: [env.WEB_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  });
  app.use((request: Request, _response: unknown, next: () => void) => {
    if (!request.header("x-request-id")) {
      request.headers["x-request-id"] = crypto.randomUUID();
    }
    next();
  });

  const swagger = new DocumentBuilder()
    .setTitle("ElWarsha API")
    .setDescription("Foundation API for the ElWarsha platform")
    .setVersion("0.1.0")
    .addCookieAuth(env.SESSION_COOKIE_NAME)
    .build();
  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup("api/docs", app, document);

  

  app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    errorHttpStatusCode: 422,

    exceptionFactory: (errors) => {
      return new UnprocessableEntityException({
        type: "https://elwarsha.dev/errors/validation-failed",
        title: "Validation Failed",
        status: 422,
        detail: "Some fields have invalid values",
        invalidParams: errors.map((error) => ({
          name: error.property,
          reason:
            Object.values(error.constraints ?? {})[0] ??
            "Invalid value",
        })),
      });
    },
  }),
);

await app.listen(env.PORT);
  logger.info("API started", { port: env.PORT });
}

void bootstrap();

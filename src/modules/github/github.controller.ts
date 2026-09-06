import { Controller, Headers, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request } from "express";

import { GithubService } from "./github.service.js";

@ApiTags("github")
@Controller("api/v1/github")
export class GithubController {
  constructor(private readonly github: GithubService) {}

  @Post("webhooks")
  accept(
    @Req() request: Request & { rawBody?: Buffer | string },
    @Headers("x-hub-signature-256") signature: string | undefined,
    @Headers("x-github-delivery") deliveryId: string | undefined,
    @Headers("x-github-event") eventType: string | undefined,
  ) {
    const rawBody = Buffer.isBuffer(request.rawBody)
      ? request.rawBody.toString("utf8")
      : (request.rawBody ??
        (typeof request.body === "string"
          ? request.body
          : JSON.stringify(request.body ?? {})));
    return this.github.acceptWebhook(rawBody, signature, deliveryId, eventType);
  }
}

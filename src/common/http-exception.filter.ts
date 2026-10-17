import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";

import { AppError } from "./errors.js";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    if (exception instanceof AppError) {
      response.status(exception.statusCode).json({
        error: {
          code: exception.code,
          message: exception.message,
          requestId: request.header("x-request-id") ?? null,
        },
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse() as Record<string, unknown> | string;
      const instance = request.path ?? request.originalUrl ?? request.url;

      if (status === HttpStatus.UNPROCESSABLE_ENTITY) {
        const invalidParams =
          typeof res === "object" && Array.isArray(res.invalidParams)
            ? res.invalidParams
            : [];
        response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
          type: "https://elwarsha.dev/errors/validation-failed",
          title: "Validation Failed",
          status: 422,
          detail: "Some fields have invalid values",
          instance,
          invalidParams,
        });
        return;
      }

      if (status === HttpStatus.CONFLICT) {
        const detail =
          typeof res === "object" && typeof res.message === "string"
            ? res.message
            : exception.message;
        response.status(HttpStatus.CONFLICT).json({
          type: "https://elwarsha.dev/errors/duplicate-application",
          title: "Application Already Submitted",
          status: 409,
          detail,
          instance,
        });
        return;
      }

      response.status(status).json({
        error: {
          code: "http_error",
          message: exception.message,
          requestId: request.header("x-request-id") ?? null,
        },
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: "internal_error",
        message: "An unexpected error occurred",
        requestId: request.header("x-request-id") ?? null,
      },
    });
  }
}

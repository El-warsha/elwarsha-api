import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";

import { AppError, ConflictError } from "./errors.js";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const requestId = request.header("x-request-id") ?? null;

    if (exception instanceof ConflictError) {
      response
        .status(409)
        .header("content-type", "application/problem+json")
        .json({
          type: "https://elwarsha.dev/errors/duplicate-application",
          title: "Application Already Submitted",
          status: 409,
          detail: exception.message,
          instance: request.url,
          error: {
            code: exception.code,
            message: exception.message,
            requestId,
          },
        });
      return;
    }

    if (exception instanceof AppError) {
      response.status(exception.statusCode).json({
        error: {
          code: exception.code,
          message: exception.message,
          requestId,
        },
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === "object" && res !== null && "invalidParams" in res) {
        const problem = res as {
          type?: string;
          title?: string;
          detail?: string;
          invalidParams: Array<{ name: string; reason: string }>;
        };
        response
          .status(status)
          .header("content-type", "application/problem+json")
          .json({
            type: problem.type ?? "https://elwarsha.dev/errors/validation-failed",
            title: problem.title ?? "Validation Failed",
            status,
            detail:
              problem.detail ??
              "One or more application fields failed validation constraints",
            instance: request.url,
            invalidParams: problem.invalidParams,
            error: {
              code: "validation_failed",
              message: problem.detail ?? "Validation failed constraints",
              requestId,
            },
          });
        return;
      }

      response.status(status).json({
        error: {
          code: "http_error",
          message: exception.message,
          requestId,
        },
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: "internal_error",
        message: "An unexpected error occurred",
        requestId,
      },
    });
  }
}

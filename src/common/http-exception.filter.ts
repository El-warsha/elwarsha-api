import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";

import {
  AppError,
  DuplicateApplicationError,
  ValidationError,
} from "./errors.js";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const instance = request.originalUrl ?? request.url;

    if (exception instanceof ValidationError) {
      response.status(422).json({
        type: "https://elwarsha.dev/errors/validation-failed",
        title: "Validation Failed",
        status: 422,
        detail: exception.message || "Some fields have invalid values",
        instance,
        invalidParams: exception.invalidParams,
      });
      return;
    }

    if (
      exception instanceof DuplicateApplicationError ||
      (exception instanceof AppError && exception.statusCode === 409) ||
      (exception instanceof HttpException && exception.getStatus() === 409)
    ) {
      const detail =
        exception instanceof Error
          ? exception.message
          : "An application with this email or GitHub handle already exists for Cohort 2";
      response.status(409).json({
        type: "https://elwarsha.dev/errors/duplicate-application",
        title: "Application Already Submitted",
        status: 409,
        detail:
          detail ||
          "An application with this email or GitHub handle already exists for Cohort 2",
        instance,
      });
      return;
    }

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
      const exceptionResponse = exception.getResponse();
      const isObjectResponse =
        typeof exceptionResponse === "object" && exceptionResponse !== null;
      const invalidParams =
        isObjectResponse && "invalidParams" in exceptionResponse
          ? (exceptionResponse as { invalidParams: unknown }).invalidParams
          : undefined;

      const body: Record<string, unknown> = {
        error: {
          code:
            status === HttpStatus.CONFLICT
              ? "conflict"
              : status === HttpStatus.UNPROCESSABLE_ENTITY
                ? "validation_error"
                : "http_error",
          message: exception.message,
          requestId: request.header("x-request-id") ?? null,
        },
      };

      if (invalidParams) {
        body.invalidParams = invalidParams;
      }

      response.status(status).json(body);
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

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";

import { AppError, DuplicateApplicationError } from "./errors.js";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    if (exception instanceof DuplicateApplicationError) {
      response.status(409).json({
        type: "https://elwarsha.dev/errors/duplicate-application",
        title: "Application Already Submitted",
        status: 409,
        detail:
          "An application with this email or GitHub handle already exists for Cohort 2",
        instance: request.originalUrl,
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

      if (
        status === 422 &&
        typeof exceptionResponse === "object" &&
        exceptionResponse !== null &&
        "type" in exceptionResponse &&
        exceptionResponse.type ===
        "https://elwarsha.dev/errors/validation-failed"
      ) {
        response.status(status).json({
          ...exceptionResponse,
          instance: request.originalUrl,
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

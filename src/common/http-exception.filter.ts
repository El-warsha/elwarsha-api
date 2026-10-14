import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";

import { AppError, ValidationFailedError, DuplicateApplicationError } from "./errors.js";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    if (exception instanceof ValidationFailedError) {
      response.status(exception.statusCode).json({
        type: exception.type,
        title: exception.title,
        status: exception.statusCode,
        detail: exception.message,
        instance: request.originalUrl,
        invalidParams: exception.invalidParams,
      });
      return;
    }
    if (exception instanceof DuplicateApplicationError) {
      response.status(exception.statusCode).json({
        type: exception.type,
        title: exception.title,
        status: exception.statusCode,
        detail: exception.message,
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
      response.status(exception.getStatus()).json({
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

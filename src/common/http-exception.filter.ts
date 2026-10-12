import {
  ArgumentsHost,
  Body,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  UnprocessableEntityException,
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

    if (exception instanceof UnprocessableEntityException) {
      const body = exception.getResponse() as {
        title?: string;
        invalidParams?: { name: string; reason: string }[];
      };
      response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        type: "https://elwarsha.dev/errors/validation-failed",
        title: "Validation Failed",
        status: 422,
        detail: "Some fields have invalid values",
        instance: "/api/v1/cohorts/" + request.params.slug + "/applications",
        invalidParams: body.invalidParams
      });
      return;
    }

    if (exception instanceof ConflictException) {
      response.status(HttpStatus.CONFLICT).json({
        type: "https://elwarsha.dev/errors/duplicate-application",
        title: "Application Already Submitted",
        status: 409,
        "detail": "An application with this email or GitHub handle already exists for " + request.params.slug.toString().replace('-', " ").charAt(0).toUpperCase() + request.params.slug.toString().replace('-', " ").slice(1),
        instance: '/api/v1/cohorts/' + request.params.slug + '/applications',
      })
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

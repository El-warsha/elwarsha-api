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
        type: string;
        title?: string;
        invalidParams?: { name: string; reason: string }[];
        detail?: string;
        instance?: string;
      };
      response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        type: body.type,
        title: body.title,
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        detail: body.detail,
        instance: body.instance,
        invalidParams: body.invalidParams
      });
      return;
    }

    if (exception instanceof ConflictException) {
      const body = exception.getResponse() as {
        type: string;
        title?: string;
        invalidParams?: { name: string; reason: string }[];
        detail?: string;
        instance?: string;
      };
      response.status(HttpStatus.CONFLICT).json({
        type: body.type,
        title: body.title,
        status: HttpStatus.CONFLICT,
        detail: body.detail,
        instance: body.instance,
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

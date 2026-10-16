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
      const exceptionResponse = exception.getResponse();

       if (status === HttpStatus.BAD_REQUEST) {
        const errorPayload = exceptionResponse as any;
        const messages = Array.isArray(errorPayload.message)
          ? errorPayload.message
          : [errorPayload.message];

        const invalidParams = messages.map((msg: string) => ({
          name: "field",
          reason: msg,
        }));

        response.status(422).json({
          title: "Validation Failed",
          status: 422,
          invalidParams,
        });
        return;
      }

      if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        response.status(status).json(exceptionResponse);
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

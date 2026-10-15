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
          type: `https://elwarsha.dev/errors/${exception.code ?? "unknown"}`,
          title: exception.name,
          status: exception.statusCode,
          detail: exception.message,
          instance: request.url,
          invalidParams: exception.details || [],
        },
      });
      return;
    }

    if (exception instanceof HttpException) {
      const resDetails = exception.getResponse() as {
        type?: string;
        title?: string;
        message: string | string[];
        error?: string;
        statusCode: number;
        invalidParams?: any[];
        retryAfter?: number;
      };

      const spacedName = exception.name
        .replace(/Exception$/, "")
        .replace(/([a-z])([A-Z])/g, "$1 $2");

      const fallbackTitle = spacedName;

      const fallbackType = spacedName.toLowerCase().replace(/ /g, "-");

      if (resDetails.retryAfter) {
        response.setHeader("Retry-After", String(resDetails.retryAfter));
      }

      response.status(exception.getStatus()).json({
        error: {
          type: `https://elwarsha.dev/errors/${resDetails.type ?? fallbackType ?? "unknown"}`,
          title: resDetails.title || fallbackTitle || "Error",
          status: resDetails.statusCode || exception.getStatus(),
          detail: Array.isArray(resDetails.message)
            ? resDetails.message[0]
            : resDetails.message || exception.message,
          instance: request.url,
          invalidParams: resDetails.invalidParams,
        },
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        type: "internal_error",
        title: "Internal Server Error",
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        detail: "An unexpected error occurred",
        instance: request.url,
        invalidParams: [],
      },
    });
  }
}

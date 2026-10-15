import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";

import { AppError } from "./errors.js";
import { messageMapper } from "./messageMapper.js";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const language=request.header('accept-language')
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
// ---Handle 422 Unprocessable Entity exceptions by translating validation errors---------//
//---- into localized messages and returning the standardized validation error response.-----//
if (status === 422) {
  if (
  typeof exceptionResponse === "object" &&
  exceptionResponse !== null &&
  "invalidParams" in exceptionResponse
) 
{
    const invalidParams = exceptionResponse.invalidParams as {
      name: string;
      reason: string;
    }[];
  
const translatedInvalidParams= messageMapper(invalidParams,language)
response.status(422).json({
  type: "https://elwarsha.dev/errors/validation-failed",
  title: "Validation Failed",
  status: 422,
  detail: "Some fields have invalid values",
  instance: request.originalUrl,
  invalidParams: translatedInvalidParams,
});

return;
}

}
//---------------------------------------------------//
//---------------------------------------------------//

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

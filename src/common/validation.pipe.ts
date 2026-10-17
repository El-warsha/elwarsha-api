import { UnprocessableEntityException, ValidationPipe } from "@nestjs/common";

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      const invalidParams = errors.flatMap((err) => {
        return Object.values(err.constraints ?? {}).map((reason) => ({
          name: err.property,
          reason,
        }));
      });

      return new UnprocessableEntityException({
        type: "https://elwarsha.dev/errors/validation-failed",
        title: "Validation Failed",
        status: 422,
        detail: "One or more application fields failed validation constraints",
        invalidParams,
      });
    },
  });
}

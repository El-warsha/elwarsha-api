import { UnprocessableEntityException, ValidationPipe } from "@nestjs/common";


export const validationPipe = new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (errors) => {
      const invalidParams = errors.map((error) => ({
        name: error.property,
        reason: Object.values(error.constraints ?? {}).join(", "),
      }));

      return new UnprocessableEntityException({
        status: 422,
        title: "Validation Failed",
        invalidParams,
      });
    },
  })
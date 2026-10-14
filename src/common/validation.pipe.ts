
import { ValidationPipe, type ValidationError } from "@nestjs/common";
import { ValidationFailedError } from "./errors.js";

export const appValidationPipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    stopAtFirstError: true,
    exceptionFactory: (errors: ValidationError[]) =>
        new ValidationFailedError(
            errors.map((error) => ({
                name: error.property,
                reason: Object.values(error.constraints ?? {})[0],
            })),
        ),
});

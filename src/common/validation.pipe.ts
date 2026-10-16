import {
  Injectable,
  ValidationPipe as NestValidationPipe,
} from "@nestjs/common";
import type { ValidationError as ClassValidatorError } from "class-validator";

import { type InvalidParam, ValidationError } from "./errors.js";

@Injectable()
export class ValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ClassValidatorError[]) => {
        const invalidParams: InvalidParam[] = [];

        function formatErrors(errs: ClassValidatorError[]): void {
          for (const error of errs) {
            if (error.constraints) {
              for (const reason of Object.values(error.constraints)) {
                invalidParams.push({
                  name: error.property,
                  reason,
                });
              }
            }
            if (error.children && error.children.length > 0) {
              formatErrors(error.children);
            }
          }
        }

        formatErrors(errors);
        return new ValidationError(
          "Some fields have invalid values",
          invalidParams,
        );
      },
    });
  }
}

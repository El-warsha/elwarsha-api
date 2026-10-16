import { ValidationError, ValidationPipe } from "@nestjs/common";

import { ValidationFailedError, type InvalidParam } from "./errors.js";

function flatten(errors: ValidationError[], parent = ""): InvalidParam[] {
  const out: InvalidParam[] = [];

  for (const err of errors) {
    const path = parent ? `${parent}.${err.property}` : err.property;

    if (err.constraints) {
      for (const reason of Object.values(err.constraints)) {
        out.push({ name: path, reason });
      }
    }

    if (err.children && err.children.length > 0) {
      out.push(...flatten(err.children, path));
    }
  }

  return out;
}

export function createAppValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[]) =>
      new ValidationFailedError(flatten(errors)),
  });
}

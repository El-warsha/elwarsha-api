import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
  ValidationPipe,
} from "@nestjs/common";

@Injectable()
export class AppValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors) => {
        const invalidParams = errors.flatMap((error) =>
          Object.values(error.constraints ?? {}).map((reason) => ({
            name: error.property,
            reason,
          })),
        );
        return new UnprocessableEntityException({ invalidParams });
      },
    });
  }
}

import { ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  InjectThrottlerOptions,
  InjectThrottlerStorage,
  ThrottlerGuard,
  type ThrottlerModuleOptions,
  ThrottlerStorage,
} from "@nestjs/throttler";
import { Reflector } from "@nestjs/core";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(
    @InjectThrottlerOptions() options: ThrottlerModuleOptions,
    @InjectThrottlerStorage() storageService: ThrottlerStorage,
    reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  protected async throwThrottlingException(
    _context: ExecutionContext,
    throttlerLimitDetail: any,
  ): Promise<void> {
    const retryAfterSeconds = Math.ceil(throttlerLimitDetail.timeToExpire);
    throw new HttpException(
      {
        type: "too-many-requests",
        title: "Too Many Requests",
        message: `You have exceeded the request limit. Please try again in ${retryAfterSeconds} seconds.`,
        retryAfter: retryAfterSeconds,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

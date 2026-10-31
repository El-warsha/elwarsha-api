import { Module } from "@nestjs/common";

import type { AppEnv } from "../../config/env.js";
import { APP_ENV } from "../../config/tokens.js";
import { Auth0IdentityProvider } from "./auth0-identity.provider.js";
import { AuthController } from "./auth.controller.js";
import { AuthGuard } from "./auth.guard.js";
import { AuthService } from "./auth.service.js";
import { FakeIdentityProvider } from "./fake-identity.provider.js";
import {
  PrismaMembershipRepository,
  PrismaSessionRepository,
  PrismaUserRepository,
} from "./identity.repositories.js";
import { SessionService } from "./session.service.js";
import { CohortMembershipGuard } from "../weeks/cohortMembership.guard.js";

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    SessionService,
    PrismaUserRepository,
    PrismaSessionRepository,
    PrismaMembershipRepository,
    CohortMembershipGuard,
    {
      provide: "UserRepository",
      useExisting: PrismaUserRepository,
    },
    {
      provide: "SessionRepository",
      useExisting: PrismaSessionRepository,
    },
    {
      provide: "MembershipRepository",
      useExisting: PrismaMembershipRepository,
    },
    {
      provide: "IdentityProvider",
      useFactory: (env: AppEnv) =>
        env.IDENTITY_PROVIDER === "auth0"
          ? new Auth0IdentityProvider(env)
          : new FakeIdentityProvider(),
      inject: [APP_ENV],
    },
  ],
  exports: [SessionService, AuthGuard,CohortMembershipGuard],
})
export class IdentityModule {}

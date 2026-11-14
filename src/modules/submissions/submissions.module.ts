import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service.js';
import { SubmissionsController } from './submissions.controller.js';
import { SubmissionsRepository } from './submissions.repository.js';
import { GithubModule } from '../github/github.module.js';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module.js';
import { IdentityModule } from '../identity/identity.module.js';

@Module({
  imports: [GithubModule, PrismaModule, IdentityModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, SubmissionsRepository],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}

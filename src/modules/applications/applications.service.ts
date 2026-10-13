import { ConflictException, Injectable } from '@nestjs/common';
import { ApplyCohortDto } from './dto/apply-cohort.dto.js';

export interface ApplicationRecord extends ApplyCohortDto {
  id: string;
  cohortSlug: string;
  status: string;
  createdAt: string;
}

@Injectable()
export class ApplicationsService {
  private applications: ApplicationRecord[] = [];

  async apply(cohortSlug: string, dto: ApplyCohortDto): Promise<ApplicationRecord> {
    // التحقق من وجود الطلب سابقاً بنفس الإيميل أو اسم GitHub
    const duplicate = this.applications.find(
      (app) =>
        app.cohortSlug === cohortSlug &&
        (app.email.toLowerCase() === dto.email.toLowerCase() ||
          app.githubHandle.toLowerCase() === dto.githubHandle.toLowerCase()),
    );

    if (duplicate) {
      throw new ConflictException(
        'An application with this email or GitHub handle already exists for Cohort 2',
      );
    }

    const newApplication: ApplicationRecord = {
      id: `app_${Date.now()}`,
      cohortSlug,
      ...dto,
      status: 'received',
      createdAt: new Date().toISOString(),
    };

    this.applications.push(newApplication);
    return newApplication;
  }
}
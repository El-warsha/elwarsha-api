import { Injectable, ConflictException } from '@nestjs/common';
import { ApplyCohortDto } from './apply-cohort.dto.js';

@Injectable()
export class ApplicationsService {
    private applications: any[] = [];

    create(dto: ApplyCohortDto) {
        const existingApplication = this.applications.find(
            (app) => app.email === dto.email || app.githubHandle === dto.githubHandle
        );

        if (existingApplication) {
            throw new ConflictException('An application with this email or GitHub handle already exists for Cohort 2');
        }

        const newApplication = {
            id: 'app_' + Math.random().toString(36).substr(2, 9),
            cohortSlug: 'cohort-2',
            ...dto,
            status: 'received',
            createdAt: new Date().toISOString(),
        };

        this.applications.push(newApplication);

        return {
            id: newApplication.id,
            cohortSlug: newApplication.cohortSlug,
            email: newApplication.email,
            status: newApplication.status,
            createdAt: newApplication.createdAt,
        };
    }
}
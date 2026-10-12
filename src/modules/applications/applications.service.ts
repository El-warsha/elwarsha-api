import { ConflictException, Injectable } from '@nestjs/common';
import { ApplyCohortDto } from './dto/apply-cohort.dto.js';

type StoredApplication = ApplyCohortDto & {
 cohortSlug: string;
 createdAt: Date 
}

@Injectable()
export class ApplicationService {

  private readonly applications: StoredApplication[] = [];

  applyCohort(dto: ApplyCohortDto, slug:string) {
    const email = dto.email.trim().toLowerCase();
    const githubHandle = dto.githubHandle.trim().toLowerCase();

    const duplicate = this.applications.some(app => 
      app.email === email || app.githubHandle === githubHandle
    );

    if(duplicate){
      throw new ConflictException({
        type: 'https://elwarsha.dev/errors/duplicate-application',
        title: 'Application Already Submitted',
        status: 409,
        detail:
          'An application with this email or GitHub handle already exists for ' + slug,
        instance: '/api/v1/cohorts/' + slug + '/applications',
      });
    }
    
    const application: StoredApplication = {
      ...dto,
      cohortSlug: slug,
      createdAt: new Date(),
    }

    this.applications.push(application);

    return {
      id : 'app_' + this.applications.length,
      cohortSlug: slug,
      email: dto.email,
      status: 'received',
      createdAt: new Date().toISOString(),
    }
  }
}

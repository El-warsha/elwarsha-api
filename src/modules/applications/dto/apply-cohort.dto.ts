import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUrl,
  Matches,
  MinLength,
} from 'class-validator';

export enum CurrentStatus {
  STUDENT = 'student',
  GRADUATE = 'graduate',
  WORKING_IN_TECH = 'working in tech',
  SWITCHING_CAREER = 'switching career',
  OTHER = 'other',
}

export enum GitExperience {
  NEVER = 'never',
  BASICS_ONLY = 'basics only',
  COMFORTABLE = 'comfortable',
}

export class ApplyCohortDto {
  // Section 1: Personal & Contact Information
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Full name must be at least 3 letters' })
  fullName: string;

  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: 'WhatsApp number must be 10 to 15 digits',
  })
  whatsappNumber: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-C0-9-]+$/, {
    message: 'GitHub handle must be username only without URL or @',
  })
  githubHandle: string;

  @IsString()
  @IsNotEmpty()
  discordHandle: string;

  // Section 2: Technical Background
  @IsEnum(CurrentStatus, { message: 'Select a valid current status' })
  currentStatus: CurrentStatus;

  @IsString()
  @IsNotEmpty()
  collegeMajor: string;

  @IsString()
  @IsNotEmpty()
  programmingExperience: string;

  @IsString()
  @IsNotEmpty()
  technologies: string;

  @IsEnum(GitExperience, { message: 'Select a valid Git experience level' })
  gitExperience: GitExperience;

  // Section 3: Personal Page Task
  @IsUrl({}, { message: 'Must be a valid URL starting with http:// or https://' })
  personalPageUrl: string;

  @IsUrl({}, { message: 'Must be a valid GitHub repository URL' })
  @Matches(/^https?:\/\/(www\.)?github\.com\/.+$/, {
    message: 'Must be a valid GitHub repository URL',
  })
  githubRepoUrl: string;

  @IsString()
  @IsNotEmpty()
  aiUsage: string;

  // Section 4: Motivation
  @IsString()
  @MinLength(50, { message: 'Must be at least 50 characters' })
  motivation: string;
}
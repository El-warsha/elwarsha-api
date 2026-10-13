import { IsEmail, IsString, MinLength, Matches, IsUrl, IsIn } from 'class-validator';

export class ApplyCohortDto {
  @IsString({ message: 'Full name must be a string' })
  @MinLength(3, { message: 'Full name must be at least 3 characters long' })
  fullName: string;

  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;

  @Matches(/^\+?\d{10,15}$/, { message: 'WhatsApp number must be 10 to 15 digits' })
  whatsappNumber: string;

  @IsString()
  githubHandle: string;

  @IsString()
  discordHandle: string; 

  @IsIn(['student', 'graduate', 'working in tech', 'switching career', 'other'], { message: 'Invalid status' })
  currentStatus: string;

  @IsString()
  collegeMajor: string;

  @IsString()
  programmingExperience: string;

  @IsString()
  technologies: string;  

  @IsIn(['never', 'basics only', 'comfortable'], { message: 'Invalid git experience' })
  gitExperience: string; 

  @IsUrl({}, { message: 'Must be a valid URL' })
  personalPageUrl: string;

  @IsUrl({}, { message: 'Must be a valid URL' })
  githubRepoUrl: string;

  @IsString()
  aiUsage: string;

  @IsString()
  @MinLength(50, { message: 'Motivation must be at least 50 characters' })
  motivation: string;
}
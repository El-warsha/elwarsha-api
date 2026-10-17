import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export const CurrentStatusEnum = [
  "student",
  "recent_graduate",
  "employed_tech",
  "career_switcher",
  "other",
] as const;
export type CurrentStatus = (typeof CurrentStatusEnum)[number];

export const GitExperienceEnum = ["none", "basics", "comfortable"] as const;
export type GitExperience = (typeof GitExperienceEnum)[number];

export class ApplyCohortDto {
  @ApiProperty({
    description: "Applicant's full name",
    example: "Ahmed Mohamed Ali",
  })
  @IsNotEmpty({ message: "Full name is required" })
  @IsString({ message: "Full name must be a string" })
  @MinLength(3, { message: "Full name must be at least 3 characters" })
  @MaxLength(70, { message: "Full name must not exceed 70 characters" })
  fullName!: string;

  @ApiProperty({
    description: "Contact email address",
    example: "ahmed@example.com",
  })
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Must be a valid email address" })
  email!: string;

  @ApiProperty({
    description: "WhatsApp contact number (10 to 15 digits)",
    example: "+201012345678",
  })
  @IsNotEmpty({ message: "WhatsApp number is required" })
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: "WhatsApp number must be between 10 and 15 digits",
  })
  whatsappNumber!: string;

  @ApiProperty({
    description: "GitHub profile username (no links)",
    example: "ahmed-mohamed",
  })
  @IsNotEmpty({ message: "GitHub handle is required" })
  @IsString()
  @Matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, {
    message: "Must be a valid GitHub username without spaces or special symbols",
  })
  githubHandle!: string;

  @ApiProperty({
    description: "Discord community username",
    example: "ahmed_dev",
  })
  @IsNotEmpty({ message: "Discord handle is required" })
  @IsString()
  @MinLength(2, { message: "Discord handle must be at least 2 characters" })
  @MaxLength(32, { message: "Discord handle must not exceed 32 characters" })
  discordHandle!: string;

  @ApiProperty({
    description: "Current academic or professional status",
    enum: CurrentStatusEnum,
    example: "student",
  })
  @IsNotEmpty({ message: "Current status is required" })
  @IsIn(CurrentStatusEnum, {
    message:
      "Current status must be student, recent_graduate, employed_tech, career_switcher, or other",
  })
  currentStatus!: CurrentStatus;

  @ApiProperty({
    description: "Faculty and major / field of study",
    example: "Faculty of Computer Science - CS Department",
  })
  @IsNotEmpty({ message: "College & Major is required" })
  @IsString()
  @MinLength(2, { message: "College & Major must be at least 2 characters" })
  @MaxLength(100, { message: "College & Major must not exceed 100 characters" })
  collegeMajor!: string;

  @ApiProperty({
    description: "How long you have been learning programming",
    example: "1.5 years",
  })
  @IsNotEmpty({ message: "Programming experience is required" })
  @IsString()
  @MinLength(2, { message: "Programming experience must be at least 2 characters" })
  @MaxLength(100, { message: "Programming experience must not exceed 100 characters" })
  programmingExperience!: string;

  @ApiProperty({
    description: "Technologies and languages practically used",
    example: "JavaScript, TypeScript, React, Express, PostgreSQL",
  })
  @IsNotEmpty({ message: "Technologies field is required" })
  @IsString()
  @MinLength(3, { message: "Technologies must be at least 3 characters" })
  @MaxLength(300, { message: "Technologies must not exceed 300 characters" })
  technologies!: string;

  @ApiProperty({
    description: "Prior Git experience level",
    enum: GitExperienceEnum,
    example: "basics",
  })
  @IsNotEmpty({ message: "Git experience is required" })
  @IsIn(GitExperienceEnum, {
    message: "Git experience must be none, basics, or comfortable",
  })
  gitExperience!: GitExperience;

  @ApiProperty({
    description: "Live URL of published personal page",
    example: "https://ahmed-mohamed.github.io",
  })
  @IsNotEmpty({ message: "Personal page URL is required" })
  @IsUrl({}, { message: "Personal page URL must be a valid HTTP or HTTPS URL" })
  personalPageUrl!: string;

  @ApiProperty({
    description: "GitHub repository URL containing the personal page source code",
    example: "https://github.com/ahmed-mohamed/my-page",
  })
  @IsNotEmpty({ message: "GitHub repository URL is required" })
  @IsUrl({}, { message: "GitHub repository URL must be a valid URL" })
  @Matches(/^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/, {
    message: "Must be a valid GitHub repository URL (https://github.com/owner/repo)",
  })
  githubRepoUrl!: string;

  @ApiProperty({
    description: "Explanation of AI tools used in building the personal page",
    example: "Used Cursor for autocompletion and Claude for debugging.",
  })
  @IsNotEmpty({ message: "AI usage explanation is required" })
  @IsString()
  @MinLength(3, { message: "AI usage explanation must be at least 3 characters" })
  @MaxLength(300, { message: "AI usage explanation must not exceed 300 characters" })
  aiUsage!: string;

  @ApiProperty({
    description: "Statement of purpose and motivation (at least 50 characters)",
    example:
      "I want to join ElWarsha Cohort 2 because I want to learn real-world full-stack development through practical vertical slices and code reviews.",
  })
  @IsNotEmpty({ message: "Motivation is required" })
  @IsString()
  @MinLength(50, { message: "Motivation statement must be at least 50 characters" })
  @MaxLength(1000, { message: "Motivation statement must not exceed 1000 characters" })
  motivation!: string;
}

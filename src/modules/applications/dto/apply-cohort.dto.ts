import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

export enum CurrentStatus {
  STUDENT = "student",
  GRADUATE = "graduate",
  WORKING_IN_TECH = "working_in_tech",
  SWITCHING_CAREER = "switching_career",
  OTHER = "other",
}

export enum GitExperience {
  NEVER = "never",
  BASICS_ONLY = "basics_only",
  COMFORTABLE = "comfortable",
}

export class CreateApplicationDto {
  @ApiProperty({
    type: String,
    example: "Mohamed Ali",
    description: "Full Name (at least 3 characters)",
  })
  @IsString({ message: "Full name must be a string" })
  @MinLength(3, { message: "Full name must be at least 3 characters" })
  @IsNotEmpty({ message: "Full name cannot be empty" })
  fullName: string;

  @ApiProperty({
    type: String,
    example: "student@example.com",
    description: "Valid Email Address",
  })
  @IsString({ message: "Email address must be a string" })
  @IsEmail({}, { message: "Must be a valid email address" })
  @IsNotEmpty({ message: "Email cannot be empty" })
  email: string;

  @ApiProperty({
    type: String,
    example: "+201012345678",
    description: "WhatsApp Number (10 to 15 digits, supports +)",
  })
  @IsString({ message: "WhatsApp number must be a string" })
  @IsNotEmpty({ message: "WhatsApp number cannot be empty" })
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: "WhatsApp number must be 10 to 15 digits, optionally starting with +",
  })
  whatsappNumber: string;

  @ApiProperty({
    type: String,
    example: "octocat",
    description: "GitHub Username only (alphanumeric & hyphens, no @ or URL)",
  })
  @IsString({ message: "GitHub handle must be a string" })
  @IsNotEmpty({ message: "GitHub handle cannot be empty" })
  @Matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, {
    message:
      "GitHub handle must be a valid username (alphanumeric and hyphens, no @ or URL)",
  })
  githubHandle: string;

  @ApiProperty({
    type: String,
    example: "discord_user",
    description: "Discord Username only (no @)",
  })
  @IsString({ message: "Discord handle must be a string" })
  @IsNotEmpty({ message: "Discord handle cannot be empty" })
  @Matches(/^[a-zA-Z0-9_.]{2,32}$/, {
    message: "Discord handle must be a valid username without @",
  })
  discordHandle: string;

  @ApiProperty({
    enum: CurrentStatus,
    example: CurrentStatus.STUDENT,
    description: "Current Status",
  })
  @IsNotEmpty({ message: "Please select a valid status" })
  @IsEnum(CurrentStatus, { message: "Status must be a valid option" })
  currentStatus: CurrentStatus;

  @ApiProperty({
    type: String,
    example: "Computer Science",
    description: "College and Major",
  })
  @IsString({ message: "College major must be a string" })
  @IsNotEmpty({ message: "College major cannot be empty" })
  collegeMajor: string;

  @ApiProperty({
    type: String,
    example: "1 year",
    description: "Programming Experience",
  })
  @IsString({ message: "Programming experience must be a string" })
  @IsNotEmpty({ message: "Programming experience cannot be empty" })
  programmingExperience: string;

  @ApiProperty({
    example: ["React", "TypeScript", "Node.js"],
    description: "Technologies Used",
    type: [String],
  })
  @IsArray({ message: "Technologies must be an array of strings" })
  @ArrayNotEmpty({ message: "Technologies cannot be empty" })
  @IsString({ each: true, message: "Each technology must be a string" })
  technologies: string[];

  @ApiProperty({
    enum: GitExperience,
    example: GitExperience.COMFORTABLE,
    description: "Git Experience",
  })
  @IsNotEmpty({ message: "Please select a valid Git experience" })
  @IsEnum(GitExperience, { message: "Git experience must be a valid option" })
  gitExperience: GitExperience;

  @ApiProperty({
    type: String,
    example: "https://my-page.dev",
    description: "Published Personal Page Link (must start with http:// or https://)",
  })
  @IsString({ message: "Personal page URL must be a string" })
  @IsNotEmpty({ message: "Personal page URL cannot be empty" })
  @Matches(/^https?:\/\/.+/, {
    message: "Personal page URL must start with http:// or https://",
  })
  personalPageUrl: string;

  @ApiProperty({
    type: String,
    example: "https://github.com/octocat/my-project",
    description: "GitHub Repository Link",
  })
  @IsString({ message: "GitHub repository URL must be a string" })
  @IsNotEmpty({ message: "GitHub repository URL cannot be empty" })
  @Matches(/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/, {
    message:
      "GitHub repository URL must be a valid GitHub repository link (e.g. https://github.com/owner/repo)",
  })
  githubRepoUrl: string;

  @ApiProperty({
    type: String,
    example: "Used AI tools for brainstorming and debugging",
    description: "AI Usage",
  })
  @IsString({ message: "AI usage must be a string" })
  @IsNotEmpty({ message: "AI usage cannot be empty" })
  aiUsage: string;

  @ApiProperty({
    type: String,
    example:
      "I am deeply committed to completing all 8 weeks, shipping real pull requests, and learning production engineering.",
    description: "Motivation (at least 50 characters)",
  })
  @IsString({ message: "Motivation must be a string" })
  @MinLength(50, { message: "Must be at least 50 characters" })
  @IsNotEmpty({ message: "Motivation cannot be empty" })
  motivation: string;
}

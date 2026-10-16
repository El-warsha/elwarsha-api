import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsIn,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export const CURRENT_STATUS_OPTIONS = [
  "student",
  "recent_graduate",
  "employed_tech",
  "career_switcher",
  "other",
] as const;

export const GIT_EXPERIENCE_OPTIONS = ["none", "basics", "comfortable"] as const;

export class ApplyCohortDto {
  @ApiProperty({ example: "Ahmed Mohamed" })
  @IsString()
  @Length(3, 100, { message: "Must be at least 3 letters" })
  fullName!: string;

  @ApiProperty({ example: "student@example.com" })
  @IsEmail({}, { message: "Must be a valid email address" })
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: "+201012345678" })
  @IsString()
  @Matches(/^\+?\d{10,15}$/, {
    message: "Must be 10 to 15 digits, optionally starting with +",
  })
  whatsappNumber!: string;

  @ApiProperty({ example: "octocat" })
  @IsString()
  @Matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/, {
    message: "Must be a valid GitHub username (alphanumeric and hyphens, no URL/@)",
  })
  githubHandle!: string;

  @ApiProperty({ example: "octocat#1234" })
  @IsString()
  @Length(2, 64, { message: "Must be a valid Discord handle" })
  discordHandle!: string;

  @ApiProperty({ enum: CURRENT_STATUS_OPTIONS })
  @IsIn(CURRENT_STATUS_OPTIONS, {
    message: `Must be one of: ${CURRENT_STATUS_OPTIONS.join(", ")}`,
  })
  currentStatus!: (typeof CURRENT_STATUS_OPTIONS)[number];

  @ApiProperty({ example: "حاسبات ومعلومات" })
  @IsString()
  @Length(2, 200, { message: "Must be at least 2 characters" })
  collegeMajor!: string;

  @ApiProperty({ example: "سنة" })
  @IsString()
  @Length(1, 100, { message: "Must be at least 1 character" })
  programmingExperience!: string;

  @ApiProperty({ example: "JavaScript, React, Node.js" })
  @IsString()
  @Length(2, 2000, { message: "Must be at least 2 characters" })
  technologies!: string;

  @ApiProperty({ enum: GIT_EXPERIENCE_OPTIONS })
  @IsIn(GIT_EXPERIENCE_OPTIONS, {
    message: `Must be one of: ${GIT_EXPERIENCE_OPTIONS.join(", ")}`,
  })
  gitExperience!: (typeof GIT_EXPERIENCE_OPTIONS)[number];

  @ApiProperty({ example: "https://ahmed.dev" })
  @IsUrl(
    { protocols: ["http", "https"], require_protocol: true },
    { message: "Must start with http:// or https://" },
  )
  personalPageUrl!: string;

  @ApiProperty({ example: "https://github.com/octocat/my-page" })
  @IsUrl(
    { protocols: ["http", "https"], require_protocol: true },
    { message: "Must be a valid GitHub repository URL" },
  )
  @Matches(/^https?:\/\/(www\.)?github\.com\/[^\/]+\/[^\/]+\/?$/i, {
    message: "Must be a GitHub repository URL (e.g. https://github.com/u/r)",
  })
  githubRepoUrl!: string;

  @ApiProperty({ example: "استخدمت ChatGPT لتحسين النصوص فقط." })
  @IsString()
  @Length(1, 2000, { message: "Must be at least 1 character" })
  aiUsage!: string;

  @ApiProperty({
    example: "عايز أتعلم بناء مشاريع حقيقية مع فريق وأطور مهاراتي في العمل الجماعي.",
  })
  @IsString()
  @MinLength(50, { message: "Must be at least 50 characters" })
  @MaxLength(2000, { message: "Must be at most 2000 characters" })
  motivation!: string;
}

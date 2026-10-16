import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  IsUrl,
  Matches,
  MinLength,
} from "class-validator";

export class CreateApplicationDto {
  @ApiProperty({
    description: "Applicant's full name",
    example: "Heba Elgohary",
    type: String,
  })
  @IsString({
    message: "fullName.invalidType",
  })
  @IsNotEmpty({
    message: "fullName.required",
  })
  @Matches(/^(?=(?:.*[a-zA-Z\u0600-\u06FF]){3,}).+$/, {
    message: "fullName.invalid",
  })
  fullName: string;

  @ApiProperty({
    description: "Applicant's email address",
    example: "heba.elgohary@example.com",
    type: String,
  })
  @IsString({
    message: "email.invalidType",
  })
  @IsNotEmpty({
    message: "email.required",
  })
  @IsEmail(
    {},
    {
      message: "email.invalid",
    },
  )
  email: string;

  @ApiProperty({
    description: "Applicant's WhatsApp phone number in international format",
    example: "+201012345678",
    type: String,
  })
  @IsString({
    message: "whatsappNumber.invalidType",
  })
  @IsNotEmpty({
    message: "whatsappNumber.required",
  })
  @Matches(/^\+?\d{10,15}$/, {
    message: "whatsappNumber.invalid",
  })
  whatsappNumber: string;

  @ApiProperty({
    description: "Applicant's GitHub username",
    example: "HebaElgohary",
    type: String,
  })
  @IsString({
    message: "githubHandle.invalidType",
  })
  @IsNotEmpty({
    message: "githubHandle.required",
  })
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: "githubHandle.invalid",
  })
  githubHandle: string;

  @ApiProperty({
    description: "Applicant's Discord username or handle",
    example: "heba_dev",
    type: String,
  })
  @IsString({
    message: "discordHandle.invalidType",
  })
  @IsNotEmpty({
    message: "discordHandle.required",
  })
  discordHandle: string;

  @ApiProperty({
    description: "Applicant's current professional or educational status",
    example: "student",
    enum: [
      "student",
      "graduate",
      "working in tech",
      "switching career",
      "other",
    ],
    type: String,
  })
  @IsString({
    message: "currentStatus.invalidType",
  })
  @IsNotEmpty({
    message: "currentStatus.required",
  })
  @IsIn(
    ["student", "graduate", "working in tech", "switching career", "other"],
    {
      message: "currentStatus.invalid",
    },
  )
  currentStatus: string;

  @ApiProperty({
    description: "Applicant's college major or field of study",
    example: "Computer and Systems Engineering",
    type: String,
  })
  @IsString({
    message: "collegeMajor.invalidType",
  })
  @IsNotEmpty({
    message: "collegeMajor.required",
  })
  @Matches(/\S/, {
    message: "collegeMajor.whitespace",
  })
  collegeMajor: string;

  @ApiProperty({
    description: "Applicant's programming experience and background",
    example: "I have built several projects using React and TypeScript.",
    type: String,
  })
  @IsString({
    message: "programmingExperience.invalidType",
  })
  @IsNotEmpty({
    message: "programmingExperience.required",
  })
  @Matches(/\S/, {
    message: "programmingExperience.whitespace",
  })
  programmingExperience: string;

  @ApiProperty({
    description: "Programming languages, frameworks, and technologies the applicant uses",
    example: "JavaScript, TypeScript, React, Next.js, Node.js",
    type: String,
  })
  @IsString({
    message: "technologies.invalidType",
  })
  @IsNotEmpty({
    message: "technologies.required",
  })
  @Matches(/\S/, {
    message: "technologies.whitespace",
  })
  technologies: string;

  @ApiProperty({
    description: "Applicant's level of experience with Git",
    example: "basics only",
    enum: ["never", "basics only", "comfortable"],
    type: String,
  })
  @IsString({
    message: "gitExperience.invalidType",
  })
  @IsNotEmpty({
    message: "gitExperience.required",
  })
  @IsIn(["never", "basics only", "comfortable"], {
    message: "gitExperience.invalid",
  })
  gitExperience: string;

  @ApiProperty({
    description: "Applicant's personal website or portfolio URL",
    example: "https://heba-portfolio.example.com",
    type: String,
  })
  @IsString({
    message: "personalPageUrl.invalidType",
  })
  @IsNotEmpty({
    message: "personalPageUrl.required",
  })
  @IsUrl(
    { require_protocol: true },
    {
      message: "personalPageUrl.invalid",
    },
  )
  @Matches(/^https?:\/\/\S+$/i, {
    message: "personalPageUrl.invalid",
  })
  personalPageUrl: string;

  @ApiProperty({
    description: "GitHub repository URL for the applicant's project",
    example: "https://github.com/HebaElgohary/sample-project",
    type: String,
  })
  @IsString({
    message: "githubRepoUrl.invalidType",
  })
  @IsNotEmpty({
    message: "githubRepoUrl.required",
  })
  @IsUrl(
    { require_protocol: true },
    {
      message: "githubRepoUrl.invalid",
    },
  )
  @Matches(/^https:\/\/github\.com\/[^/\s?#]+\/[^/\s?#]+\/?$/i, {
    message: "githubRepoUrl.invalid",
  })
  githubRepoUrl: string;

  @ApiProperty({
    description: "How the applicant uses AI tools during learning or development",
    example: "I use AI to understand concepts and review my code.",
    type: String,
  })
  @IsString({
    message: "aiUsage.invalidType",
  })
  @IsNotEmpty({
    message: "aiUsage.required",
  })
  @Matches(/\S/, {
    message: "aiUsage.whitespace",
  })
  aiUsage: string;

  @ApiProperty({
    description: "Applicant's motivation for joining the cohort (at least 50 characters)",
    example:
      "I want to improve my problem-solving skills, collaborate with other developers, and build production-ready projects.",
    minLength: 50,
    type: String,
  })
  @IsString({
    message: "motivation.invalidType",
  })
  @IsNotEmpty({
    message: "motivation.required",
  })
  @MinLength(50, {
    message: "motivation.minLength",
  })
  @Matches(/\S/, {
    message: "motivation.whitespace",
  })
  motivation: string;}
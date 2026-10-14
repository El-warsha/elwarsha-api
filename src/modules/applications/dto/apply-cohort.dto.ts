
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  IsUrl,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateApplicationDto {
  @IsString({
    message: 'fullName.invalidType',
  })
  @IsNotEmpty({
    message: 'fullName.required',
  })
  @Matches(/^ (?=(?:.*[a-zA-Z\u0600-\u06FF]){3}).+$/, {
    message: 'fullName.invalid',
  })
  fullName: string;

  @IsString({
    message: 'email.invalidType',
  })
  @IsNotEmpty({
    message: 'email.required',
  })
  @IsEmail({}, {
    message: 'email.invalid',
  })
  email: string;

  @IsString({
    message: 'whatsappNumber.invalidType',
  })
  @IsNotEmpty({
    message: 'whatsappNumber.required',
  })
  @Matches(/^\+?\d{10,15}$/, {
    message: 'whatsappNumber.invalid',
  })
  whatsappNumber: string;

  @IsString({
    message: 'githubHandle.invalidType',
  })
  @IsNotEmpty({
    message: 'githubHandle.required',
  })
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'githubHandle.invalid',
  })
  githubHandle: string;

  @IsString({
    message: 'discordHandle.invalidType',
  })
  @IsNotEmpty({
    message: 'discordHandle.required',
  })
  discordHandle: string;

  @IsString({
    message: 'currentStatus.invalidType',
  })
  @IsNotEmpty({
    message: 'currentStatus.required',
  })
  @IsIn(
    [
      'student',
      'graduate',
      'working in tech',
      'switching career',
      'other',
    ],
    {
      message: 'currentStatus.invalid',
    },
  )
  currentStatus: string;

  @IsString({
    message: 'collegeMajor.invalidType',
  })
  @IsNotEmpty({
    message: 'collegeMajor.required',
  })
  @Matches(/\S/, {
    message: 'collegeMajor.whitespace',
  })
  collegeMajor: string;

  @IsString({
    message: 'programmingExperience.invalidType',
  })
  @IsNotEmpty({
    message: 'programmingExperience.required',
  })
  @Matches(/\S/, {
    message: 'programmingExperience.whitespace',
  })
  programmingExperience: string;

  @IsString({
    message: 'technologies.invalidType',
  })
  @IsNotEmpty({
    message: 'technologies.required',
  })
  @Matches(/\S/, {
    message: 'technologies.whitespace',
  })
  technologies: string;

  @IsString({
    message: 'gitExperience.invalidType',
  })
  @IsNotEmpty({
    message: 'gitExperience.required',
  })
  @IsIn(['never', 'basics only', 'comfortable'], {
    message: 'gitExperience.invalid',
  })
  gitExperience: string;

  @IsString({
    message: 'personalPageUrl.invalidType',
  })
  @IsNotEmpty({
    message: 'personalPageUrl.required',
  })
  @IsUrl(
    { require_protocol: true },
    {
      message: 'personalPageUrl.invalid',
    },
  )
  @Matches(/^https?:\/\/\S+$/i, {
    message: 'personalPageUrl.invalid',
  })
  personalPageUrl: string;

  @IsString({
    message: 'githubRepoUrl.invalidType',
  })
  @IsNotEmpty({
    message: 'githubRepoUrl.required',
  })
  @IsUrl(
    { require_protocol: true },
    {
      message: 'githubRepoUrl.invalid',
    },
  )
  @Matches(/^https:\/\/github\.com\/[^/\s?#]+\/[^/\s?#]+\/?$/i, {
    message: 'githubRepoUrl.invalid',
  })
  githubRepoUrl: string;

  @IsString({
    message: 'aiUsage.invalidType',
  })
  @IsNotEmpty({
    message: 'aiUsage.required',
  })
  @Matches(/\S/, {
    message: 'aiUsage.whitespace',
  })
  aiUsage: string;

  @IsString({
    message: 'motivation.invalidType',
  })
  @IsNotEmpty({
    message: 'motivation.required',
  })
  @MinLength(50, {
    message: 'motivation.minLength',
  })
  @Matches(/\S/, {
    message: 'motivation.whitespace',
  })
  motivation: string;
}

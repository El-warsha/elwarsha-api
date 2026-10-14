import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  Matches,
  IsIn,
  IsUrl,
} from "class-validator";

export class ApplyCohortDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Matches(/^\+?\d{10,15}$/, {
    message: "WhatsApp number must be 10 to 15 digits and can start with +",
  })
  @IsNotEmpty()
  whatsappNumber: string;

  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: "GitHub handle must contain only letters, numbers, and hyphens",
  })
  @IsNotEmpty()
  githubHandle: string;

  @Matches(/^[\w.]+$/, {
    message:
      "Discord handle must contain only letters, numbers, dots, and underscores, with no spaces",
  })
  @IsNotEmpty()
  discordHandle: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(["student", "graduate", "working in tech", "switching career", "other"])
  currentStatus: string;

  @IsString()
  @IsNotEmpty()
  collegeMajor: string;

  @IsString()
  @IsNotEmpty()
  programmingExperience: string;

  @IsString()
  @IsNotEmpty()
  technologies: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(["never", "basics only", "comfortable"])
  gitExperience: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @Matches(/^https?:\/\/.+/, {
    message: "Personal page URL must be a valid HTTP or HTTPS URL",
  })
  personalPageUrl: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @Matches(/^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/?$/, {
    message: "GitHub Repo Url must be a valid GitHub repository URL",
  })
  githubRepoUrl: string;

  @IsString()
  @IsNotEmpty()
  aiUsage: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  motivation: string;
}

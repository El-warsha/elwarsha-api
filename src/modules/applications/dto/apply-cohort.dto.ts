import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUrl,
  Matches,
  MinLength,
} from "class-validator";

export enum CurrentStatus {
  Student = "student",
  Graduate = "graduate",
  WorkingInTech = "working in tech",
  SwitchingCareer = "switching career",
  Other = "other",
}

export enum GitExperience {
  Never = "never",
  BasicsOnly = "basics only",
  Comfortable = "comfortable",
}

export class ApplyCohortDto {
  @IsNotEmpty({ message: "full name is required" })
  @IsString({ message: "Full name must be a string" })
  @MinLength(3, { message: "Full name must be at least 3 characters long" })
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(/^\+?[0-9]\d{1,15}$/, {
    message: "WhatsApp number must be a valid international phone number",
  })
  whatsappNumber: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: "GitHub handle can only contain letters, numbers, underscores, and hyphens",
  })
  githubHandle: string;

  @IsNotEmpty()
  @IsString()
  discordHandle: string;

  @IsNotEmpty()
  @IsEnum(CurrentStatus, { message: "Invalid current status" })
  currentStatus: CurrentStatus;

  @IsNotEmpty()
  @IsString()
  collegeMajor: string;

  @IsNotEmpty()
  @IsString()
  programmingExperience: string;

  @IsNotEmpty()
  @IsString()
  technologies: string;

  @IsNotEmpty()
  @IsEnum(GitExperience, { message: "Invalid git experience" })
  gitExperience: GitExperience;

  @IsNotEmpty()
  @IsUrl(
    {
      require_protocol: true,
      protocols: ["http", "https"],
    },
    { message: "Url must be a valid URL with http or https protocol" },
  )
  personalPageUrl: string;

  @IsNotEmpty()
  @IsUrl(
    {
      protocols: ["http", "https"],
      require_host: true,
      host_whitelist: ["github.com"],
    },
    {
      message:
        "GitHub repo URL must be a valid URL with http or https protocol and a valid GitHub host",
    },
  )
  githubRepoUrl: string;

  @IsNotEmpty()
  @IsString()
  aiUsage: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(50, { message: "Motivation must be at least 50 characters" })
  motivation: string;
}

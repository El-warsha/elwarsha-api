
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUrl,
  Length,
  Matches,
  MinLength,
  IsIn
} from "class-validator";


export const CurrentStatus = {
  Student: "student",
  Graduate: "recent_graduate",
  WorkingInTech: "employed_tech",
  SwitchingCareer: "career_switcher",
  Other: "other",
} as const;
export const GitExperience = {
  Never: "none",
  BasicsOnly: "basics",
  Comfortable: "comfortable",
} as const;
export class ApplyCohortDto {
  @IsString({ message: "Full name must be text" })
  @Length(3, 100, {
    message: "Full name must be between 3 and 100 characters",
  })
  @IsNotEmpty({ message: "Full name is required" })
  @Matches(/\S/, {
    message: "Full name must contain at least one non-space character",
  })
  fullName: string;

  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Enter a valid email address" })
  email: string;

  @IsNotEmpty({ message: "WhatsApp number is required" })
  @Matches(/^\+?\d{10,15}$/, {
    message: "WhatsApp number must contain 10 to 15 digits and may start with +",
  })
  whatsappNumber: string;

  @IsString({ message: "GitHub username must be text" })
  @IsNotEmpty({ message: "GitHub username is required" })
  @Matches(/^(?!-)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/, {
    message: "Enter a valid GitHub username",
  })
  githubHandle: string;

  @IsNotEmpty({ message: "Discord handle is required" })
  @IsString({ message: "Discord handle must be text" })
  discordHandle: string;

  @IsNotEmpty({ message: "Please select your current status" })
  @IsIn(Object.values(CurrentStatus), {
    message: "Select a valid current status",
  })
  currentStatus: (typeof CurrentStatus)[keyof typeof CurrentStatus];

  @IsNotEmpty({ message: "College major is required" })
  @IsString({ message: "College major must be text" })
  collegeMajor: string;

  @IsNotEmpty({ message: "Programming experience is required" })
  @IsString({ message: "Programming experience must be text" })
  programmingExperience: string;

  @IsString({ message: "Technologies must be text" })
  @IsNotEmpty({ message: "Please enter the technologies you use" })
  technologies: string;

  @IsNotEmpty({ message: "Please select your Git experience level" })

  @IsIn(Object.values(GitExperience), {
    message: "Select a valid GitExperience experience level",
  })
  GitExperience: (typeof GitExperience)[keyof typeof GitExperience];

  @IsNotEmpty({ message: "Personal page URL is required" })
  @IsUrl(
    {
      protocols: ["http", "https"],
      require_protocol: true,
    },
    { message: "Enter a valid personal page URL starting with http:// or https://" },
  )
  personalPageUrl: string;

  @IsNotEmpty({ message: "GitHub repository URL is required" })
  @IsUrl(
    {
      protocols: ["https"],
      require_protocol: true,
    },
    { message: "Enter a valid HTTPS URL for your GitHub repository" },
  )
  @Matches(/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/, {
    message: "Enter a valid GitHub repository URL, such as https://github.com/username/repository",
  })
  githubRepoUrl: string;

  @IsNotEmpty({ message: "Please describe how you use AI tools" })
  @IsString({ message: "AI usage description must be text" })
  aiUsage: string;

  @IsNotEmpty({ message: "Motivation is required" })
  @MinLength(50, {
    message: "Motivation must be at least 50 characters",
  })
  motivation: string;
}

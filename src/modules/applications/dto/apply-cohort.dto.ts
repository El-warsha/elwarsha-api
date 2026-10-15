import { IsEmail, IsIn, IsNotEmpty, IsString, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';

export class ApplyCohortDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: 'Phone must contain 10 to 15 digits and may start with +',
  })
  whatsappNumber: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?!-)(?!.*--)[a-zA-Z0-9-]{1,39}(?<!-)$/, {
    message: 'githubHandle must be a valid GitHub username',
  })
  @MinLength(3)
  @MaxLength(40)
  githubHandle:string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  @Matches(/^[a-z0-9._]+$/, {
    message: 'discordHandle must contain only lowercase letters, numbers, dots, and underscores',
  })
  discordHandle:string;
  
  @IsNotEmpty()
  @IsString()
  @IsIn(["student", "recent_graduate", "employed_tech", "career_switcher", "other"])
  currentStatus:string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(70)
  collegeMajor:string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  programmingExperience:string;

  @IsString()
  @IsNotEmpty()
  technologies: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(["never", "basics", "comfortable"])
  gitExperience: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl(
    {
      protocols: ["https", "http"]
    },
    { message: "Personal page URL is not valid" },
  )
  personalPageUrl: string;

  @IsNotEmpty()
  @IsString()
  aiUsage: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  motivation: string;
}
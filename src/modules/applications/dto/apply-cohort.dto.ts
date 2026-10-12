import { IsEmail, IsIn, IsNotEmpty, IsString, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';

export class ApplyCohortDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: 'Phone must contain 10 to 15 digits and may start with +',
  })
  whatsappNumber: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?!-)(?!.*--)[a-zA-Z0-9-]{1,39}(?<!-)$/, {
    message: 'githubHandle must be a valid GitHub username',
  })
  @MinLength(3)
  @MaxLength(40)
  githubHandle:string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(32)
  @Matches(/^[a-z0-9._]+$/, {
    message: 'discordHandle must contain only lowercase letters, numbers, dots, and underscores',
  })
  discordHandle:string;
  
  @IsString()
  @IsNotEmpty()
  @Matches(/^(student|graduate|working in tech|switching career|other)$/, {
    message: 'currentStatus must be one of the following: student, graduate, working in tech, switching career, other',
  })
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
  @IsIn(["never", "basics only", "comfortable"])
  gitExperience: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  personalPageUrl: string;

  @IsString()
  @IsNotEmpty()
  aiUsage: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  motivation: string;
}
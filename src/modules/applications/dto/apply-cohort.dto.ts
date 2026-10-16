import { IsString, IsEmail, IsUrl, MinLength, IsNotEmpty, Matches } from 'class-validator';

export class applyCohort{
    @IsString() 
    @MinLength(3)
    @IsNotEmpty()
    fullName : string

    @IsEmail({}, { message: "Must be a valid email address" })
    @IsNotEmpty()
    email : string

    @IsString() 
    @IsNotEmpty()
    @Matches(/^\+?[0-9]{10,15}$/,{message :"phone number must be 10 to 15 digits"})
    whatsappNumber : string

    @IsString() 
    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9-]+$/, { message: "github handle must contain only letters, numbers, and hyphens. no URL used" })
    githubHandle : string

    @IsString() 
    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9-]+$/, { message: "discord handle must contain only letters, numbers, and hyphens. no URL used" })
    discordHandle : string

    @IsString() 
    @IsNotEmpty()
    currentStatus : string

    @IsString() 
    @IsNotEmpty()
    collegeMajor : string

    @IsString() 
    @IsNotEmpty()
    programmingExperience : string

    @IsString() 
    @IsNotEmpty()
    technologies : string

    @IsString() 
    @IsNotEmpty()
    gitExperience : string

    @IsString() 
    @IsNotEmpty()
    @IsUrl({require_protocol:true,protocols:["https","http"]}, {message:"personal page url must start with http:// or https:// and "})
    personalPageUrl : string

    @IsString() 
    @IsNotEmpty()
    @Matches(/https?:\/\/github\.com\/[^\/]+\/[^\/]+$/, { message: "github repo url must be a valid github repo url" })
    githubRepoUrl : string

    @IsString() 
    @IsNotEmpty()
    aiUsage : string

    @IsString() 
    @MinLength(50, { message: "Must be at least 50 characters" })
    motivation : string
}

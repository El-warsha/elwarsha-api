import { IsEmail, IsIn, IsNotEmpty, IsString, IsUrl, Matches, MinLength } from "class-validator";


export class ApplyCohortDto {

    // sec1 : personal info

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @Matches(/^[A-Za-z\u0600-\u06FF]+(?:\s+[A-Za-z\u0600-\u06FF]+)*$/, {
        message: "Full name must contain only Arabic or English letters separated by spaces",
    })
    fullName!: string;

    @IsEmail()
    @IsNotEmpty()
    email !: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^\+?\d{10,15}$/, { message: "WhatsApp number must contain 10 to 15 digits, with an optional + prefix" })
    whatsappNumber !: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9-]+$/, { message: "GitHub handle must contain only letters, numbers, and hyphens", })
    githubHandle !: string;

    @IsString()
    @IsNotEmpty()
    discordHandle !: string;

    //sec2: tech background

    @IsIn(["student", "graduate", "working in tech", "switching career", "other"])
    currentStatus !: string;

    @IsString()
    @IsNotEmpty()
    collegeMajor !: string;

    @IsString()
    @IsNotEmpty()
    programmingExperience !: string;

    @IsString()
    @IsNotEmpty()
    technologies !: string;

    @IsIn(['never', 'basics only', 'comfortable'])
    gitExperience !: string;

    //sec3: personal page

    @IsString()
    @IsNotEmpty()
    @IsUrl({ require_protocol: true, protocols: ["http", "https"] })
    personalPageUrl !: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9._-]+\/?$/, { message: "Must be a valid GitHub Repository URL" })
    githubRepoUrl !: string;

    @IsString()
    @IsNotEmpty()
    aiUsage !: string;

    // motivation

    @IsString()
    @IsNotEmpty()
    @MinLength(50, { message: "Motivation must be at least 50 characters", })
    motivation !: string;

}
import { PartialType } from "@nestjs/swagger";
import { CreateApplicationDto } from "./apply-cohort.dto.js";

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {}

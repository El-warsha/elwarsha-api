import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class AssignmentQueryDto {
  @ApiPropertyOptional({ description: "Pagination cursor", type: String })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: "Number of items to fetch", default: 10, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: "Filter by label ID", type: String })
  @IsOptional()
  @IsUUID()

  labelId?: string;
}
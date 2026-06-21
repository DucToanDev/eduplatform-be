import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateStudentProfileDto {
  @ApiPropertyOptional({ example: '2012-05-20' })
  @IsOptional()
  @IsDateString()
  readonly date_of_birth?: string;

  @ApiPropertyOptional({ example: 'Grade 6' })
  @IsOptional()
  @IsString()
  readonly grade_level?: string;

  @ApiPropertyOptional({ example: '0901234567' })
  @IsOptional()
  @IsString()
  readonly parent_phone?: string;

  @ApiPropertyOptional({ example: 100, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly points?: number;

  @ApiPropertyOptional({ example: 'PARENT-ABC-123' })
  @IsOptional()
  @IsString()
  readonly parent_access_codes?: string;
}

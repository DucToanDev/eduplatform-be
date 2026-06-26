import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateProgressDto {
  @ApiProperty({
    example: '60c72b2f9b1d8b001c8e4b5a',
    description: 'ID của bài học',
  })
  @IsMongoId()
  @IsNotEmpty()
  lesson_id: string;

  @ApiPropertyOptional({ example: 8.5, minimum: 0, description: 'Điểm số' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  score?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Trạng thái hoàn thành bài học',
  })
  @IsOptional()
  @IsBoolean()
  is_completed?: boolean;
}

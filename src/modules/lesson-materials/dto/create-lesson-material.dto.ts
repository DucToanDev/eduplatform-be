import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MaterialType } from '../schemas/lesson-material.schema';

export class CreateLessonMaterialDto {
  @ApiProperty({
    example: '60c72b2f9b1d8b001c8e4b5a',
    description: 'ID của bài học chứa tài liệu',
  })
  @IsMongoId()
  @IsNotEmpty()
  lesson_id: string;

  @ApiProperty({
    enum: MaterialType,
    description: 'Loại tài liệu',
    example: MaterialType.DOCX,
  })
  @IsEnum(MaterialType)
  @IsNotEmpty()
  material_type: MaterialType;

  @ApiPropertyOptional({
    description:
      'Nội dung văn bản (dùng khi tài liệu là text, không upload file)',
  })
  @IsOptional()
  @IsString()
  content_data?: string;

  @ApiPropertyOptional({
    example: 0,
    minimum: 0,
    description: 'Thứ tự hiển thị (để trống sẽ tự thêm vào cuối)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order_index?: number;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { MaterialType } from '../schemas/lesson-material.schema';

export class UpdateLessonMaterialDto {
  @ApiPropertyOptional({ enum: MaterialType, description: 'Loại tài liệu' })
  @IsOptional()
  @IsEnum(MaterialType)
  material_type?: MaterialType;

  @ApiPropertyOptional({ description: 'URL tài liệu' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: 'Nội dung văn bản' })
  @IsOptional()
  @IsString()
  content_data?: string;

  @ApiPropertyOptional({ minimum: 0, description: 'Thứ tự hiển thị' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order_index?: number;
}

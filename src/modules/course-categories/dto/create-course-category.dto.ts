import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCourseCategoryDto {
  @ApiProperty({ example: 'Tiếng Anh' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Các khóa học tiếng Anh' })
  @IsString()
  @IsOptional()
  description?: string;
}

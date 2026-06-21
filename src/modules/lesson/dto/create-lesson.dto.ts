import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({
    example: '60c72b2f9b1d8b001c8e4b5a',
    description: 'ID của khóa học',
  })
  @IsMongoId()
  @IsNotEmpty()
  course_id: string;

  @ApiProperty({
    example: 'Bài 1: Giới thiệu NestJS',
    description: 'Tiêu đề bài học',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'Nội dung chi tiết của bài học...',
    description: 'Nội dung văn bản',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    example: 'https://youtube.com/watch?v=123',
    description: 'URL video bài giảng',
  })
  @IsUrl({ require_protocol: true })
  @IsOptional()
  video_url?: string;

  @ApiPropertyOptional({
    example: 1,
    minimum: 0,
    description: 'Thứ tự sắp xếp của bài học',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order_index?: number;
}

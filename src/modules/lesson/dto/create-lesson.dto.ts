import { IsNotEmpty, IsString, IsOptional, IsNumber, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({ example: '60c72b2f9b1d8b001c8e4b5a', description: 'ID của khóa học (Course)' }) //vd mẫu trường dữ liệu cho ui đọc
  @IsMongoId()
  @IsNotEmpty()
  course_id: string;

  @ApiProperty({ example: 'Bài 1: Giới thiệu NestJS', description: 'Tiêu đề bài học' })//vd mẫu trường dữ liệu cho ui đọc
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Nội dung chi tiết của bài học...', description: 'Nội dung văn bản' })//vd mẫu trường dữ liệu cho ui đọc
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=123', description: 'URL Video bài giảng' })//vd mẫu trường dữ liệu cho ui đọc
  @IsString()
  @IsOptional()
  video_url?: string;

  @ApiPropertyOptional({ example: 1, description: 'Thứ tự sắp xếp của bài học' })//vd mẫu trường dữ liệu cho ui đọc
  @IsNumber()
  @IsOptional()
  order_index?: number;
}
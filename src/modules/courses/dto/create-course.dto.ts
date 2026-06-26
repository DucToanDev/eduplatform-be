import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @ApiProperty({ example: 'Tiếng Anh cơ bản', description: 'Tên khóa học' })
  @IsNotEmpty({ message: 'Tiêu đề khóa học không được để trống' })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Khóa học dành cho người mới bắt đầu',
    description: 'Mô tả khóa học',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/thumbnail.jpg',
    description: 'URL ảnh thumbnail',
  })
  @IsOptional()
  @IsString()
  thumbnail_url?: string;

  @ApiPropertyOptional({
    example: '665a1b2c3d4e5f6a7b8c9d0e',
    description: 'ID danh mục khóa học',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Khóa học demo (miễn phí xem trước)',
  })
  @IsOptional()
  @IsBoolean()
  is_demo?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Cho phép bán trên marketplace',
  })
  @IsOptional()
  @IsBoolean()
  is_marketplace?: boolean;

  @ApiPropertyOptional({
    example: 0,
    description: 'Giá khóa học (VND)',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Giá khóa học không được nhỏ hơn 0' })
  @Type(() => Number)
  price?: number;
}

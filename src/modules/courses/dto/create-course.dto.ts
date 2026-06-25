import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    example: 'Khóa học Tiếng Anh cơ bản',
    description: 'Tên khóa học',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'Mô tả ngắn gọn về khóa học',
    description: 'Mô tả chi tiết',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'Tiếng Anh',
    description: 'Danh mục khóa học',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Có phải là khóa học demo/dùng thử hay không',
  })
  @IsBoolean()
  @IsOptional()
  is_demo?: boolean;

  @ApiPropertyOptional({
    example: 100000,
    description: 'Giá tiền của khóa học (0 nếu miễn phí)',
  })
  @IsNumber()
  @IsOptional()
  price?: number;
}

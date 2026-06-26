import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { CourseStatus } from '../schemas/course.schema';

export class CourseQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: '665a1b2c3d4e5f6a7b8c9d0e',
    description: 'Lọc theo ID danh mục',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    enum: CourseStatus,
    description: 'Lọc theo trạng thái khóa học',
  })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiPropertyOptional({
    example: 'true',
    description: 'Lọc khóa học marketplace (true/false)',
  })
  @IsOptional()
  @IsString()
  is_marketplace?: string;

  @ApiPropertyOptional({
    example: '665a1b2c3d4e5f6a7b8c9d0e',
    description: 'Lọc theo ID giáo viên (author)',
  })
  @IsOptional()
  @IsString()
  author_id?: string;

  @ApiPropertyOptional({
    example: 'Tiếng Anh',
    description: 'Tìm kiếm theo tên khóa học',
  })
  @IsOptional()
  @IsString()
  search?: string;

  // Ghi đè cấu hình Swagger của class cha để Swagger UI không hiểu nhầm thành Object
  @ApiPropertyOptional({ type: Number, description: 'Số trang' })
  page: number = 1;

  @ApiPropertyOptional({ type: Number, description: 'Số lượng item mỗi trang' })
  limit: number = 10;
}

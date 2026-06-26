import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { CourseStatus } from '../schemas/course.schema';

export class UpdateCourseStatusDto {
  @ApiProperty({
    enum: CourseStatus,
    example: CourseStatus.PUBLISHED,
    description: 'Trạng thái mới của khóa học',
  })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsEnum(CourseStatus, { message: 'Trạng thái không hợp lệ' })
  status: CourseStatus;

  @ApiPropertyOptional({
    example: 'Nội dung chưa phù hợp',
    description: 'Lý do từ chối (bắt buộc khi status = REJECTED)',
  })
  @ValidateIf((o) => o.status === CourseStatus.REJECTED)
  @IsNotEmpty({
    message: 'Lý do từ chối không được để trống khi reject khóa học',
  })
  @IsString()
  @IsOptional()
  rejection_reason?: string;
}

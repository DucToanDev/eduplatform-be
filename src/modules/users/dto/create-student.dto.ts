import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ description: 'Họ và tên học sinh' })
  @IsNotEmpty()
  @IsString()
  fullname: string;

  @ApiProperty({ description: 'Lớp học' })
  @IsNotEmpty()
  @IsString()
  grade_level: string;

  @ApiProperty({ description: 'Giới tính', enum: ['MALE', 'FEMALE', 'OTHER'] })
  @IsNotEmpty()
  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  gender: string;

  @ApiPropertyOptional({ description: 'Tên đăng nhập (để trống sẽ tự sinh)' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'Mật khẩu (để trống sẽ tự sinh)' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    description: 'Danh sách ID lớp học (để thêm học sinh vào các lớp)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  class_ids?: string[];
}

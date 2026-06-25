import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ClassStatus } from '../schemas/class.schema';

export class CreateClassDto {
  @ApiProperty({ example: 'Lớp 3A', description: 'Tên lớp học' })
  @IsNotEmpty()
  @IsString()
  class_name: string;

  @ApiPropertyOptional({ description: 'ID khóa học gắn với lớp' })
  @IsOptional()
  @IsString()
  course_id?: string;

  @ApiPropertyOptional({ enum: ClassStatus, default: ClassStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ClassStatus)
  status?: ClassStatus;
}

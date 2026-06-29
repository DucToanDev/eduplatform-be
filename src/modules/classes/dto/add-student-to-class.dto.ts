import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class AddStudentToClassDto {
  @ApiProperty({ example: '6659f9f7c1e9e7f0c4f0d111', required: false })
  @IsOptional()
  @IsString()
  student_id?: string;

  @ApiProperty({ example: 'student@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
}

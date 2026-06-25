import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddStudentToClassDto {
  @ApiProperty({ example: '6659f9f7c1e9e7f0c4f0d111' })
  @IsString()
  @IsNotEmpty()
  student_id: string;
}

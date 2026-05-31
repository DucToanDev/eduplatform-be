import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({ example: 'Lớp 3A', description: 'Tên lớp học' })
  @IsNotEmpty()
  @IsString()
  class_name: string;
}

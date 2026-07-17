import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { CreateStudentDto } from './create-student.dto';

export class BulkImportStudentsDto {
  @ApiProperty({
    description: 'Danh sách học sinh cần thêm',
    type: [CreateStudentDto],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateStudentDto)
  students: CreateStudentDto[];
}

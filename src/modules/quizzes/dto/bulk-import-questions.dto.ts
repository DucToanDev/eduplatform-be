import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';

export class BulkImportQuestionItemDto {
  @ApiProperty({
    example: 'Thủ đô của Việt Nam là gì?',
    description: 'Nội dung câu hỏi',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng'],
    description: 'Mảng các lựa chọn',
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  options: string[];

  @ApiProperty({
    example: 0,
    description: 'Vị trí của đáp án đúng (bắt đầu từ 0)',
  })
  @IsNumber()
  @IsNotEmpty()
  correct_option_index: number;
}

export class BulkImportQuestionsDto {
  @ApiProperty({
    description: 'Danh sách câu hỏi cần thêm vào bài Quiz',
    type: [BulkImportQuestionItemDto],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BulkImportQuestionItemDto)
  questions: BulkImportQuestionItemDto[];
}

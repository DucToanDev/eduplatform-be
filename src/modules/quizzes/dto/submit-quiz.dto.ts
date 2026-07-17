import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class QuizAnswerDto {
  @ApiProperty({
    description: 'ID của câu hỏi',
    example: '66a1b2c3d4e5f67890123456',
  })
  @IsString()
  question_id: string;

  @ApiProperty({
    description: 'Index của đáp án mà học sinh chọn (Ví dụ: 0 là A, 1 là B)',
    example: 1,
  })
  @IsNumber()
  selected_index: number;
}

export class SubmitQuizDto {
  @ApiProperty({
    description: 'Danh sách các câu trả lời của học sinh',
    type: [QuizAnswerDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];
}

import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsArray,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({
    example: '60d5ecb8b392d70015342a32',
    description: 'ID của bài Quiz',
  })
  @IsMongoId()
  @IsNotEmpty()
  quiz_id: string;

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

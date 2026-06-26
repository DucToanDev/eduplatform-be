import { IsString, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QuestionRewardItemDto {
  @ApiProperty({ description: 'ID của câu hỏi', example: '6677f525d81b8a1c90f2babc' })
  @IsString()
  question_id: string;

  @ApiProperty({ description: 'Số điểm thưởng nếu trả lời ĐÚNG', example: 10 })
  @IsNumber()
  @Min(0)
  reward_points: number;
}

export class BulkQuestionRewardDto {
  @ApiProperty({ 
    description: 'Danh sách thiết lập điểm thưởng', 
    type: [QuestionRewardItemDto],
    example: [
      { question_id: '6677f525d81b8a1c90f2babc', reward_points: 10 },
      { question_id: '6677f525d81b8a1c90f2b123', reward_points: 20 }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionRewardItemDto)
  items: QuestionRewardItemDto[];
}

import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LessonRewardConfigDto {
  @ApiProperty({ description: 'ID của Bài học (Lesson)', example: '6677f525d81b8a1c90f2babc' })
  @IsString()
  lesson_id: string;

  @ApiProperty({ description: 'Số điểm thưởng khi học sinh hoàn thành Bài học', example: 50 })
  @IsNumber()
  @Min(0)
  reward_points: number;
}

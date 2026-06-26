import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateCompletionDto {
  @ApiProperty({
    example: true,
    description: 'Đánh dấu bài học đã hoàn thành hay chưa',
  })
  @IsBoolean()
  is_completed: boolean;
}

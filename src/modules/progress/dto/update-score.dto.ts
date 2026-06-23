import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateScoreDto {
  @ApiProperty({
    example: 8.5,
    minimum: 0,
    description: 'Điểm số của học sinh',
  })
  @IsNumber()
  @Min(0)
  score: number;
}

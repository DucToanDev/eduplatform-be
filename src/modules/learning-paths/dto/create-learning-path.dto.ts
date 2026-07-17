import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class LessonRefDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lesson_id: string;

  @ApiProperty()
  @IsNumber()
  order_index: number;
}

class StageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  stage_name: string;

  @ApiProperty({ type: [LessonRefDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonRefDto)
  lessons: LessonRefDto[];
}

export class CreateLearningPathDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  class_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ type: [StageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StageDto)
  stages: StageDto[];
}

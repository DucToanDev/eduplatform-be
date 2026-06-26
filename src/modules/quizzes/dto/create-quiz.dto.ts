import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsEnum,
  IsNumber,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuizType } from '../schemas/quiz.schema';

export class CreateQuizDto {
  @ApiProperty({
    enum: QuizType,
    example: QuizType.LESSON_QUIZ,
    description: 'Loại Quiz',
  })
  @IsEnum(QuizType)
  @IsNotEmpty()
  quiz_type: QuizType;

  @ApiPropertyOptional({
    example: '60d5ecb8b392d70015342a32',
    description: 'ID của khóa học (bắt buộc nếu là COURSE_EXAM)',
  })
  @ValidateIf((o) => o.quiz_type === QuizType.COURSE_EXAM)
  @IsMongoId()
  @IsNotEmpty()
  course_id?: string;

  @ApiPropertyOptional({
    example: '60d5ecb8b392d70015342a32',
    description: 'ID của bài học (bắt buộc nếu là LESSON_QUIZ)',
  })
  @ValidateIf((o) => o.quiz_type === QuizType.LESSON_QUIZ)
  @IsMongoId()
  @IsNotEmpty()
  lesson_id?: string;

  @ApiProperty({
    example: 'Bài kiểm tra số 1',
    description: 'Tên của bài Quiz',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Thứ tự hiển thị (dùng cho COURSE_EXAM)',
  })
  @ValidateIf((o) => o.quiz_type === QuizType.COURSE_EXAM)
  @IsNumber()
  @IsNotEmpty()
  order_index?: number;
}

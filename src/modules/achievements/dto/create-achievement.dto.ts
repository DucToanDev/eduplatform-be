import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAchievementDto {
  @ApiProperty({ example: 'Thợ săn điểm 10' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Đạt điểm tuyệt đối trong 1 bài kiểm tra bất kỳ' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'https://example.com/badge.png' })
  @IsString()
  @IsOptional()
  badge_url?: string;

  @ApiProperty({ example: 'QUIZ_SCORE', enum: ['QUIZ_SCORE', 'LESSONS_COMPLETED', 'LOGIN_STREAK', 'COURSE_COMPLETED', 'FIRST_LOGIN', 'AVATAR_UPDATED', 'QUIZ_EARLY_SUBMIT', 'WEEKEND_WARRIOR'] })
  @IsString()
  @IsEnum(['QUIZ_SCORE', 'LESSONS_COMPLETED', 'LOGIN_STREAK', 'COURSE_COMPLETED', 'FIRST_LOGIN', 'AVATAR_UPDATED', 'QUIZ_EARLY_SUBMIT', 'WEEKEND_WARRIOR'])
  condition_type: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  condition_value: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  point_reward: number;
}

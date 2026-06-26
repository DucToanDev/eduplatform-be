import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsNumber, IsOptional } from 'class-validator';

export class UpdateQuestionDto {
  @ApiProperty({ example: 'Thủ đô của Việt Nam là gì?', description: 'Nội dung câu hỏi', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ example: ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng'], description: 'Các đáp án lựa chọn', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @ApiProperty({ example: 0, description: 'Index của đáp án đúng trong mảng options (bắt đầu từ 0)', required: false })
  @IsNumber()
  @IsOptional()
  correct_option_index?: number;
}

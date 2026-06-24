import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateTeacherProfileDto {
  @ApiPropertyOptional({ example: 'Giáo viên toán với 5 năm kinh nghiệm' })
  @IsOptional()
  @IsString()
  readonly bio?: string;

  @ApiPropertyOptional({ example: 'Toán học, Đại số, Hình học' })
  @IsOptional()
  @IsString()
  readonly expertise?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  readonly experience_years?: number;

  @ApiPropertyOptional({ example: '0937424255' })
  @IsOptional()
  @IsString()
  readonly phone?: string;
}

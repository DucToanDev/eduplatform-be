import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTeacherProfileDto {
  @ApiPropertyOptional({ example: 'Giáo viên toán với 5 năm kinh nghiệm' })
  @IsOptional()
  @IsString()
  readonly bio?: string;

  @ApiPropertyOptional({ example: 'Toán học, Đại số, Hình học' })
  @IsOptional()
  @IsString()
  readonly expertise?: string;
}

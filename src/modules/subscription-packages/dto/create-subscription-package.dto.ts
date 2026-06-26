import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSubscriptionPackageDto {
  @ApiProperty({ example: 'Gói Cơ Bản' })
  @IsString()
  name: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  max_classes: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  max_students_per_class: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  can_sell_courses: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order_index?: number;

  @ApiPropertyOptional({ example: ['Hỗ trợ 24/7', 'Báo cáo chi tiết'] })
  @IsOptional()
  features?: any;
}

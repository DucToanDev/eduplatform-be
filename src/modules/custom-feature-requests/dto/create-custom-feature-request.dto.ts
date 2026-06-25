import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomFeatureRequestDto {
  @ApiProperty({ example: 'Tôi muốn có chức năng tạo đề theo ma trận.' })
  @IsString()
  @IsNotEmpty()
  request_content: string;

  @ApiPropertyOptional({ example: '0909123456 hoặc teacher@example.com' })
  @IsOptional()
  @IsString()
  contact_info?: string;
}

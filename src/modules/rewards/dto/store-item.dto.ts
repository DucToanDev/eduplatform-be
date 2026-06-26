import { IsString, IsNumber, IsOptional, IsEnum, Min, IsUrl } from 'class-validator';
import { StoreItemStatus } from '../schemas/store-item.schema';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoreItemDto {
  @ApiProperty({ description: 'Phân loại vật phẩm', example: 'Khung Avatar' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Tên vật phẩm', example: 'Khung Rồng Lửa VIP' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết', example: 'Khung avatar rồng lửa rực cháy dành cho học sinh xuất sắc' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Giá mua (số điểm thưởng cần để đổi)', example: 100 })
  @IsNumber()
  @Min(0)
  points: number;

  @ApiProperty({ description: 'Số lượng tồn kho', example: 50 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ description: 'Đường dẫn ảnh minh hoạ', example: 'https://example.com/khung-rong-lua.png' })
  @IsOptional()
  @IsUrl()
  image_url?: string;

  @ApiPropertyOptional({ enum: StoreItemStatus, description: 'Trạng thái', example: StoreItemStatus.ACTIVE })
  @IsOptional()
  @IsEnum(StoreItemStatus)
  status?: StoreItemStatus;
}

export class UpdateStoreItemDto {
  @ApiPropertyOptional({ description: 'Phân loại vật phẩm', example: 'Avatar' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Tên vật phẩm', example: 'Avatar Cú Mèo' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết', example: 'Avatar cú mèo thông thái' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Giá mua', example: 200 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({ description: 'Số lượng tồn kho', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: 'Đường dẫn ảnh minh hoạ', example: 'https://example.com/avatar-cu-meo.png' })
  @IsOptional()
  @IsUrl()
  image_url?: string;

  @ApiPropertyOptional({ enum: StoreItemStatus, description: 'Trạng thái', example: StoreItemStatus.ACTIVE })
  @IsOptional()
  @IsEnum(StoreItemStatus)
  status?: StoreItemStatus;
}

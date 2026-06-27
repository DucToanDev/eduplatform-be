import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdjustPointsDto {
  @ApiProperty({
    description: 'Số điểm muốn cộng (số dương) hoặc trừ (số âm)',
    example: 50,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export class RedeemItemDto {
  @ApiProperty({
    description: 'ID của vật phẩm muốn mua trong cửa hàng',
    example: '6677f525d81b8a1c90f2babc',
  })
  @IsNotEmpty()
  item_id: string;
}

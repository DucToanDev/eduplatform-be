import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class RedeemItemDto {
  @ApiProperty({ example: '60c72b2f9b1d8b001c8e4b5b' })
  @IsMongoId()
  @IsNotEmpty()
  item_id: string;
}

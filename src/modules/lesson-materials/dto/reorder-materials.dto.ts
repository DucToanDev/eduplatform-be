import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsMongoId } from 'class-validator';

export class ReorderMaterialsDto {
  @ApiProperty({
    type: [String],
    description: 'Danh sách ID tài liệu theo đúng thứ tự mong muốn',
    example: ['60c72b2f9b1d8b001c8e4b5a', '60c72b2f9b1d8b001c8e4b5b'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  ordered_ids: string[];
}

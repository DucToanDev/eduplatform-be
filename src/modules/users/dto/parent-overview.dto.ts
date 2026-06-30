import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ParentOverviewRequestDto {
  @ApiProperty({ example: 'PHHS1234', description: 'Mã truy cập dành cho phụ huynh' })
  @IsString()
  @IsNotEmpty()
  parent_access_code: string;
}

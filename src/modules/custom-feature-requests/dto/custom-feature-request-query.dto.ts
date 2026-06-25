import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { CustomFeatureRequestStatus } from '../schemas/custom-feature-request.schema';

export class CustomFeatureRequestQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: CustomFeatureRequestStatus })
  @IsOptional()
  @IsEnum(CustomFeatureRequestStatus)
  status?: CustomFeatureRequestStatus;

  @ApiPropertyOptional({ description: 'Lọc theo teacher id' })
  @IsOptional()
  @IsString()
  teacher_id?: string;
}

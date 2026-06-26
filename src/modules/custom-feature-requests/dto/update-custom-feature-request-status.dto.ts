import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CustomFeatureRequestStatus } from '../schemas/custom-feature-request.schema';

export class UpdateCustomFeatureRequestStatusDto {
  @ApiProperty({ enum: CustomFeatureRequestStatus })
  @IsEnum(CustomFeatureRequestStatus)
  status: CustomFeatureRequestStatus;
}

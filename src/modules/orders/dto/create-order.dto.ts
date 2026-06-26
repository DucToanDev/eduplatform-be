import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { OrderReferenceType, PaymentMethod } from '../schemas/order.schema';

export class CreateOrderDto {
  @ApiProperty({ enum: OrderReferenceType })
  @IsEnum(OrderReferenceType)
  reference_type: OrderReferenceType;

  @ApiProperty({ type: String })
  @IsMongoId()
  reference_id: string;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;
}

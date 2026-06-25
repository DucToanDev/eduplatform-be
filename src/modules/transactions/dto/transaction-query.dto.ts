import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { TransactionType } from '../schemas/transaction.schema';

export class TransactionQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  transaction_type?: TransactionType;

  @ApiPropertyOptional({ description: 'ID người nhận giao dịch' })
  @IsOptional()
  @IsString()
  recipient_id?: string;

  @ApiPropertyOptional({ description: 'ID đơn hàng liên quan' })
  @IsOptional()
  @IsString()
  order_id?: string;
}

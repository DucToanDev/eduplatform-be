import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  buildPaginatedResponse,
  getPaginationSkip,
} from '../../common/utils/pagination.util';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { TransactionQueryDto } from './dto/transaction-query.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  async findAll(query: TransactionQueryDto) {
    const filter = this.buildFilter(query);
    const [data, total] = await Promise.all([
      this.transactionModel
        .find(filter)
        .populate('recipient_id', 'fullname email username role avatar_url')
        .sort({ created_at: -1, _id: -1 })
        .skip(getPaginationSkip(query))
        .limit(query.limit)
        .exec(),
      this.transactionModel.countDocuments(filter),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  async findForTeacher(teacherId: string, query: PaginationQueryDto) {
    if (!Types.ObjectId.isValid(teacherId)) {
      throw new BadRequestException('Teacher id không hợp lệ');
    }

    const filter: QueryFilter<TransactionDocument> = {
      recipient_id: new Types.ObjectId(teacherId),
    };
    const [data, total] = await Promise.all([
      this.transactionModel
        .find(filter)
        .sort({ created_at: -1, _id: -1 })
        .skip(getPaginationSkip(query))
        .limit(query.limit)
        .exec(),
      this.transactionModel.countDocuments(filter),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  private buildFilter(
    query: TransactionQueryDto,
  ): QueryFilter<TransactionDocument> {
    const filter: QueryFilter<TransactionDocument> = {};

    if (query.transaction_type) {
      filter.transaction_type = query.transaction_type;
    }

    if (query.recipient_id) {
      if (!Types.ObjectId.isValid(query.recipient_id)) {
        throw new BadRequestException('Recipient id không hợp lệ');
      }
      filter.recipient_id = new Types.ObjectId(query.recipient_id);
    }

    if (query.order_id) {
      if (!Types.ObjectId.isValid(query.order_id)) {
        throw new BadRequestException('Order id không hợp lệ');
      }
      filter.order_id = new Types.ObjectId(query.order_id);
    }

    return filter;
  }
}

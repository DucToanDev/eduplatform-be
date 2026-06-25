import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
  TransactionType,
} from '../transactions/schemas/transaction.schema';
import { RevenueReportQueryDto } from './dto/revenue-report-query.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  async getRevenueReport(query: RevenueReportQueryDto) {
    const filter = this.buildFilter(query);
    const byType = await this.transactionModel.aggregate<{
      _id: TransactionType;
      total_amount: number;
      transaction_count: number;
    }>([
      { $match: filter },
      {
        $group: {
          _id: '$transaction_type',
          total_amount: { $sum: '$amount' },
          transaction_count: { $sum: 1 },
        },
      },
    ]);

    const summary = {
      total_revenue: 0,
      total_commission: 0,
      total_teacher_income: 0,
      transaction_count: 0,
      by_type: byType.map((item) => ({
        transaction_type: item._id,
        total_amount: item.total_amount,
        transaction_count: item.transaction_count,
      })),
    };

    for (const item of byType) {
      summary.transaction_count += item.transaction_count;

      if (item._id === TransactionType.PAYMENT_TO_ADMIN) {
        summary.total_revenue += item.total_amount;
      }

      if (item._id === TransactionType.COMMISSION_FEE) {
        summary.total_commission += item.total_amount;
      }

      if (item._id === TransactionType.TEACHER_INCOME) {
        summary.total_teacher_income += item.total_amount;
      }
    }

    return summary;
  }

  async getTeacherRevenueReport(
    teacherId: string,
    query: RevenueReportQueryDto,
  ) {
    if (!Types.ObjectId.isValid(teacherId)) {
      throw new BadRequestException('Teacher id không hợp lệ');
    }

    return this.getRevenueReport({
      ...query,
      teacher_id: teacherId,
    });
  }

  private buildFilter(
    query: RevenueReportQueryDto,
  ): QueryFilter<TransactionDocument> {
    const filter: QueryFilter<TransactionDocument> = {};

    if (query.teacher_id) {
      if (!Types.ObjectId.isValid(query.teacher_id)) {
        throw new BadRequestException('Teacher id không hợp lệ');
      }
      filter.recipient_id = new Types.ObjectId(query.teacher_id);
    }

    if (query.from_date || query.to_date) {
      filter.created_at = {};

      if (query.from_date) {
        filter.created_at.$gte = new Date(query.from_date);
      }

      if (query.to_date) {
        const toDate = new Date(query.to_date);
        toDate.setHours(23, 59, 59, 999);
        filter.created_at.$lte = toDate;
      }
    }

    return filter;
  }
}

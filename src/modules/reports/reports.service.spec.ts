/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ReportsService } from './reports.service';
import { TransactionType } from '../transactions/schemas/transaction.schema';

describe('ReportsService', () => {
  const transactionModel = {
    aggregate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should aggregate revenue and commission by transaction type', async () => {
    transactionModel.aggregate.mockResolvedValue([
      {
        _id: TransactionType.PAYMENT_TO_ADMIN,
        total_amount: 1000,
        transaction_count: 2,
      },
      {
        _id: TransactionType.COMMISSION_FEE,
        total_amount: 200,
        transaction_count: 1,
      },
      {
        _id: TransactionType.TEACHER_INCOME,
        total_amount: 800,
        transaction_count: 1,
      },
    ]);
    const service = new ReportsService(transactionModel as never);

    const result = await service.getRevenueReport({
      from_date: '2026-01-01',
      to_date: '2026-01-31',
    });

    expect(transactionModel.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          created_at: {
            $gte: new Date('2026-01-01'),
            $lte: expect.any(Date),
          },
        },
      },
      {
        $group: {
          _id: '$transaction_type',
          total_amount: { $sum: '$amount' },
          transaction_count: { $sum: 1 },
        },
      },
    ]);
    expect(result.total_revenue).toBe(1000);
    expect(result.total_commission).toBe(200);
    expect(result.total_teacher_income).toBe(800);
    expect(result.transaction_count).toBe(4);
  });
});

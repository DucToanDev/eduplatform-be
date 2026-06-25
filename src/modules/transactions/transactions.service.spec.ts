/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionType } from './schemas/transaction.schema';

function createQueryChain(result: unknown) {
  return {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(result),
  };
}

describe('TransactionsService', () => {
  const transactionModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated admin transactions with filters', async () => {
    const data = [{ amount: 100 }];
    const chain = createQueryChain(data);
    transactionModel.find.mockReturnValue(chain);
    transactionModel.countDocuments.mockResolvedValue(1);
    const service = new TransactionsService(transactionModel as never);

    const result = await service.findAll({
      page: 2,
      limit: 5,
      transaction_type: TransactionType.COMMISSION_FEE,
      recipient_id: '6659f9f7c1e9e7f0c4f0d111',
    });

    expect(transactionModel.find).toHaveBeenCalledWith({
      transaction_type: TransactionType.COMMISSION_FEE,
      recipient_id: expect.any(Object),
    });
    expect(chain.skip).toHaveBeenCalledWith(5);
    expect(chain.limit).toHaveBeenCalledWith(5);
    expect(result).toEqual({
      data,
      total: 1,
      page: 2,
      limit: 5,
      total_pages: 1,
    });
  });

  it('should reject invalid recipient id', async () => {
    const service = new TransactionsService(transactionModel as never);

    await expect(
      service.findAll({ page: 1, limit: 10, recipient_id: 'bad-id' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  RewardBalance,
  RewardBalanceDocument,
} from './schemas/reward-balance.schema';

@Injectable()
export class PointsService {
  constructor(
    @InjectModel(RewardBalance.name)
    private rewardBalanceModel: Model<RewardBalanceDocument>,
  ) {}

  async adjustPoints(studentId: string, amount: number) {
    return this.rewardBalanceModel.findOneAndUpdate(
      { student_id: new Types.ObjectId(studentId) },
      { $inc: { balance: amount } },
      { new: true, upsert: true },
    );
  }

  async getBalance(studentId: string) {
    const record = await this.rewardBalanceModel
      .findOne({ student_id: new Types.ObjectId(studentId) })
      .exec();
    return { balance: record?.balance || 0 };
  }
}

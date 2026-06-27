import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import {
  RewardBalance,
  RewardBalanceDocument,
} from './schemas/reward-balance.schema';
import { ClassesService } from '../classes/classes.service';

@Injectable()
export class PointsService {
  constructor(
    @InjectModel(RewardBalance.name)
    private rewardBalanceModel: Model<RewardBalanceDocument>,
    private readonly classesService: ClassesService,
  ) {}

  async adjustPoints(
    studentId: string,
    amount: number,
    session?: ClientSession,
  ) {
    return this.rewardBalanceModel.findOneAndUpdate(
      { student_id: new Types.ObjectId(studentId) },
      { $inc: { balance: amount } },
      { new: true, upsert: true, session },
    );
  }

  async getBalance(studentId: string, session?: ClientSession) {
    const record = await this.rewardBalanceModel
      .findOne({ student_id: new Types.ObjectId(studentId) })
      .session(session || null)
      .exec();
    return { balance: record?.balance || 0 };
  }
}

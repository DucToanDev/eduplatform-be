import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  StoreItem,
  StoreItemDocument,
  StoreItemStatus,
} from './schemas/store-item.schema';
import {
  StudentInventory,
  StudentInventoryDocument,
} from './schemas/student-inventory.schema';
import {
  RewardBalance,
  RewardBalanceDocument,
} from './schemas/reward-balance.schema';
import {
  QuestionRewardConfig,
  QuestionRewardConfigDocument,
} from './schemas/question-reward-config.schema';
import {
  LessonRewardConfig,
  LessonRewardConfigDocument,
} from './schemas/lesson-reward-config.schema';
import {
  RewardClaimHistory,
  RewardClaimHistoryDocument,
} from './schemas/reward-claim-history.schema';
import {
  QuizSubmission,
  QuizSubmissionDocument,
} from '../quizzes/schemas/quiz-submission.schema';

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(StoreItem.name)
    private storeItemModel: Model<StoreItemDocument>,
    @InjectModel(StudentInventory.name)
    private studentInventoryModel: Model<StudentInventoryDocument>,
    @InjectModel(RewardBalance.name)
    private rewardBalanceModel: Model<RewardBalanceDocument>,
    @InjectModel(QuestionRewardConfig.name)
    private questionRewardConfigModel: Model<QuestionRewardConfigDocument>,
    @InjectModel(LessonRewardConfig.name)
    private lessonRewardConfigModel: Model<LessonRewardConfigDocument>,
    @InjectModel(RewardClaimHistory.name)
    private rewardClaimHistoryModel: Model<RewardClaimHistoryDocument>,
    @InjectModel(QuizSubmission.name)
    private quizSubmissionModel: Model<QuizSubmissionDocument>,
  ) {}

  //Store Items
  async createStoreItem(teacherId: string, createDto: any) {
    return this.storeItemModel.create({
      ...createDto,
      teacher_id: new Types.ObjectId(teacherId),
    });
  }

  async updateStoreItem(teacherId: string, itemId: string, updateDto: any) {
    const item = await this.storeItemModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(itemId),
        teacher_id: new Types.ObjectId(teacherId),
      },
      updateDto,
      { new: true },
    );
    if (!item)
      throw new NotFoundException(
        'Store item not found or you do not have permission',
      );
    return item;
  }

  async deleteStoreItem(teacherId: string, itemId: string) {
    const item = await this.storeItemModel.findOneAndDelete({
      _id: new Types.ObjectId(itemId),
      teacher_id: new Types.ObjectId(teacherId),
    });
    if (!item)
      throw new NotFoundException(
        'Store item not found or you do not have permission',
      );
    return { success: true };
  }

  async getActiveStoreItems() {
    return this.storeItemModel
      .find({ status: StoreItemStatus.ACTIVE, stock: { $gt: 0 } })
      .exec();
  }

  async getStoreItemById(itemId: string) {
    const item = await this.storeItemModel.findById(itemId).exec();
    if (!item) throw new NotFoundException('Store item not found');
    return item;
  }

  //Points & Balances
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

  //Inventory & Redeem
  async redeemItem(studentId: string, itemId: string) {
    const studentObjId = new Types.ObjectId(studentId);
    const itemObjId = new Types.ObjectId(itemId);

    const item = await this.storeItemModel.findById(itemObjId);
    if (!item || item.status !== StoreItemStatus.ACTIVE || item.stock <= 0) {
      throw new BadRequestException('Item is not available');
    }

    const balanceRecord = await this.rewardBalanceModel.findOne({
      student_id: studentObjId,
    });
    const currentBalance = balanceRecord?.balance || 0;

    if (currentBalance < item.points) {
      throw new BadRequestException('Not enough points');
    }

    // Deduct points
    await this.rewardBalanceModel.updateOne(
      { student_id: studentObjId },
      { $inc: { balance: -item.points } },
    );

    // Decrease stock, increase sold_count
    await this.storeItemModel.updateOne(
      { _id: itemObjId },
      { $inc: { stock: -1, sold_count: 1 } },
    );

    // Add to inventory
    const inventoryItem = await this.studentInventoryModel.create({
      student_id: studentObjId,
      item_id: itemObjId,
      type: item.type,
      points: item.points,
      active: false,
    });

    return inventoryItem;
  }

  async getStudentInventory(studentId: string) {
    return this.studentInventoryModel
      .find({ student_id: new Types.ObjectId(studentId) })
      .populate('item_id')
      .exec();
  }

  async toggleInventoryItem(studentId: string, inventoryId: string) {
    const inventoryItem = await this.studentInventoryModel.findOne({
      _id: new Types.ObjectId(inventoryId),
      student_id: new Types.ObjectId(studentId),
    });
    if (!inventoryItem) throw new NotFoundException('Inventory item not found');

    inventoryItem.active = !inventoryItem.active;
    await inventoryItem.save();
    return inventoryItem;
  }

  //Question Reward Config
  async bulkConfigureQuestions(
    teacherId: string,
    items: { question_id: string; reward_points: number }[],
  ) {
    const operations = items.map((item) => ({
      updateOne: {
        filter: { question_id: new Types.ObjectId(item.question_id) },
        update: {
          $set: {
            reward_points: item.reward_points,
            teacher_id: new Types.ObjectId(teacherId),
          },
        },
        upsert: true,
      },
    }));
    await this.questionRewardConfigModel.bulkWrite(operations);
    return { success: true, count: items.length };
  }

  //Lesson Reward Config
  async configureLessonReward(
    teacherId: string,
    lessonId: string,
    rewardPoints: number,
  ) {
    return this.lessonRewardConfigModel.findOneAndUpdate(
      { lesson_id: new Types.ObjectId(lessonId) },
      {
        reward_points: rewardPoints,
        teacher_id: new Types.ObjectId(teacherId),
      },
      { new: true, upsert: true },
    );
  }

  //Quiz Claim
  async claimQuizReward(studentId: string, submissionId: string) {
    const studentObjId = new Types.ObjectId(studentId);
    const subObjId = new Types.ObjectId(submissionId);

    const existingClaim = await this.rewardClaimHistoryModel.findOne({
      student_id: studentObjId,
      reference_id: subObjId,
      reference_type: 'QUIZ',
    });
    if (existingClaim) {
      throw new BadRequestException('Reward already claimed for this quiz');
    }

    const submission = await this.quizSubmissionModel
      .findOne({ _id: subObjId, student_id: studentObjId })
      .exec();
    if (!submission) {
      throw new NotFoundException('Quiz submission not found');
    }

    const correctQuestionIds = submission.answers
      .filter((ans) => ans.is_correct)
      .map((ans) => new Types.ObjectId(ans.question_id));

    if (correctQuestionIds.length === 0) {
      await this.rewardClaimHistoryModel.create({
        student_id: studentObjId,
        reference_id: subObjId,
        reference_type: 'QUIZ',
      });
      return { rewarded_points: 0 };
    }

    const configs = await this.questionRewardConfigModel
      .find({ question_id: { $in: correctQuestionIds } })
      .exec();

    const totalPoints = configs.reduce(
      (sum, config) => sum + config.reward_points,
      0,
    );

    await this.rewardBalanceModel.findOneAndUpdate(
      { student_id: studentObjId },
      { $inc: { balance: totalPoints } },
      { upsert: true },
    );
    await this.rewardClaimHistoryModel.create({
      student_id: studentObjId,
      reference_id: subObjId,
      reference_type: 'QUIZ',
    });

    return { rewarded_points: totalPoints };
  }

  //Lesson Claim
  async claimLessonReward(studentId: string, lessonId: string) {
    const studentObjId = new Types.ObjectId(studentId);
    const lessonObjId = new Types.ObjectId(lessonId);

    const existingClaim = await this.rewardClaimHistoryModel.findOne({
      student_id: studentObjId,
      reference_id: lessonObjId,
      reference_type: 'LESSON',
    });
    if (existingClaim) {
      throw new BadRequestException('Reward already claimed for this lesson');
    }

    const config = await this.lessonRewardConfigModel.findOne({
      lesson_id: lessonObjId,
    });
    if (!config || config.reward_points <= 0) {
      throw new BadRequestException('No reward available for this lesson');
    }

    await this.rewardBalanceModel.findOneAndUpdate(
      { student_id: studentObjId },
      { $inc: { balance: config.reward_points } },
      { upsert: true },
    );

    await this.rewardClaimHistoryModel.create({
      student_id: studentObjId,
      reference_id: lessonObjId,
      reference_type: 'LESSON',
    });

    return { rewarded_points: config.reward_points };
  }
}

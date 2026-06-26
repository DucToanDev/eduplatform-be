import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
import { PointsService } from '../points/points.service';

@Injectable()
export class LearningRewardsService {
  constructor(
    @InjectModel(QuestionRewardConfig.name)
    private questionRewardConfigModel: Model<QuestionRewardConfigDocument>,
    @InjectModel(LessonRewardConfig.name)
    private lessonRewardConfigModel: Model<LessonRewardConfigDocument>,
    @InjectModel(RewardClaimHistory.name)
    private rewardClaimHistoryModel: Model<RewardClaimHistoryDocument>,
    @InjectModel(QuizSubmission.name)
    private quizSubmissionModel: Model<QuizSubmissionDocument>,
    private pointsService: PointsService,
  ) {}

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

    await this.pointsService.adjustPoints(studentId, totalPoints);

    await this.rewardClaimHistoryModel.create({
      student_id: studentObjId,
      reference_id: subObjId,
      reference_type: 'QUIZ',
    });

    return { rewarded_points: totalPoints };
  }

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

    await this.pointsService.adjustPoints(studentId, config.reward_points);

    await this.rewardClaimHistoryModel.create({
      student_id: studentObjId,
      reference_id: lessonObjId,
      reference_type: 'LESSON',
    });

    return { rewarded_points: config.reward_points };
  }
}

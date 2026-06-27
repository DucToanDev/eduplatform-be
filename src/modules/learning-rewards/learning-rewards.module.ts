import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LearningRewardsService } from './learning-rewards.service';
import { LearningRewardsController } from './learning-rewards.controller';
import {
  QuestionRewardConfig,
  QuestionRewardConfigSchema,
} from './schemas/question-reward-config.schema';
import {
  LessonRewardConfig,
  LessonRewardConfigSchema,
} from './schemas/lesson-reward-config.schema';
import {
  RewardClaimHistory,
  RewardClaimHistorySchema,
} from './schemas/reward-claim-history.schema';
import {
  QuizSubmission,
  QuizSubmissionSchema,
} from '../quizzes/schemas/quiz-submission.schema';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuestionRewardConfig.name, schema: QuestionRewardConfigSchema },
      { name: LessonRewardConfig.name, schema: LessonRewardConfigSchema },
      { name: RewardClaimHistory.name, schema: RewardClaimHistorySchema },
      { name: QuizSubmission.name, schema: QuizSubmissionSchema },
    ]),
    PointsModule,
  ],
  controllers: [LearningRewardsController],
  providers: [LearningRewardsService],
  exports: [LearningRewardsService],
})
export class LearningRewardsModule {}

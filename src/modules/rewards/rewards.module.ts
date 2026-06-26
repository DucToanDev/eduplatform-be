import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { StoreItem, StoreItemSchema } from './schemas/store-item.schema';
import { StudentInventory, StudentInventorySchema } from './schemas/student-inventory.schema';
import { RewardBalance, RewardBalanceSchema } from './schemas/reward-balance.schema';
import { QuestionRewardConfig, QuestionRewardConfigSchema } from './schemas/question-reward-config.schema';
import { LessonRewardConfig, LessonRewardConfigSchema } from './schemas/lesson-reward-config.schema';
import { RewardClaimHistory, RewardClaimHistorySchema } from './schemas/reward-claim-history.schema';
import { QuizSubmission, QuizSubmissionSchema } from '../quizzes/schemas/quiz-submission.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoreItem.name, schema: StoreItemSchema },
      { name: StudentInventory.name, schema: StudentInventorySchema },
      { name: RewardBalance.name, schema: RewardBalanceSchema },
      { name: QuestionRewardConfig.name, schema: QuestionRewardConfigSchema },
      { name: LessonRewardConfig.name, schema: LessonRewardConfigSchema },
      { name: RewardClaimHistory.name, schema: RewardClaimHistorySchema },
      { name: QuizSubmission.name, schema: QuizSubmissionSchema },
    ]),
  ],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}

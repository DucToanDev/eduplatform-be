import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import {
  RewardBalance,
  RewardBalanceSchema,
} from './schemas/reward-balance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RewardBalance.name, schema: RewardBalanceSchema },
    ]),
  ],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}

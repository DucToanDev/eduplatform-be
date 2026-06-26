import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeacherSubscriptionsService } from './teacher-subscriptions.service';
import { TeacherSubscriptionsController } from './teacher-subscriptions.controller';
import {
  TeacherSubscription,
  TeacherSubscriptionSchema,
} from './schemas/teacher-subscription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TeacherSubscription.name, schema: TeacherSubscriptionSchema },
    ]),
  ],
  providers: [TeacherSubscriptionsService],
  controllers: [TeacherSubscriptionsController],
  exports: [TeacherSubscriptionsService],
})
export class TeacherSubscriptionsModule {}

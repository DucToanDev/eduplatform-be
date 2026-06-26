import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeacherSubscriptionsService } from './teacher-subscriptions.service';
import { TeacherSubscriptionsController } from './teacher-subscriptions.controller';
import {
  TeacherSubscription,
  TeacherSubscriptionSchema,
} from './schemas/teacher-subscription.schema';
import { SubscriptionPackagesModule } from '../subscription-packages/subscription-packages.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TeacherSubscription.name, schema: TeacherSubscriptionSchema },
    ]),
    SubscriptionPackagesModule,
  ],
  providers: [TeacherSubscriptionsService],
  controllers: [TeacherSubscriptionsController],
  exports: [TeacherSubscriptionsService],
})
export class TeacherSubscriptionsModule {}

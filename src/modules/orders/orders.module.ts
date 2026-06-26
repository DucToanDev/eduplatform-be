import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import { SubscriptionPackagesModule } from '../subscription-packages/subscription-packages.module';
import { TeacherSubscriptionsModule } from '../teacher-subscriptions/teacher-subscriptions.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    SubscriptionPackagesModule,
    TeacherSubscriptionsModule,
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}

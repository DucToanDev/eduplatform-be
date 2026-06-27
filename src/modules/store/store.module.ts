import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { StoreItem, StoreItemSchema } from './schemas/store-item.schema';
import {
  StudentInventory,
  StudentInventorySchema,
} from './schemas/student-inventory.schema';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoreItem.name, schema: StoreItemSchema },
      { name: StudentInventory.name, schema: StudentInventorySchema },
    ]),
    PointsModule,
  ],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}

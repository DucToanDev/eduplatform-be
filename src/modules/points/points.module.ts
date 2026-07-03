import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { ClassesModule } from '../classes/classes.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ClassesModule, UsersModule],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}

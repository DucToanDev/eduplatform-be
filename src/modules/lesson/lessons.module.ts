import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ClassesModule } from '../classes/classes.module';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import {
  LessonMaterial,
  LessonMaterialSchema,
} from './schemas/lesson-material.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lesson.name, schema: LessonSchema },
      { name: LessonMaterial.name, schema: LessonMaterialSchema },
    ]),
    AuthModule,
    ClassesModule,
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}

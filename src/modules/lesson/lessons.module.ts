import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { AuthModule } from '../auth/auth.module';
import { CoursesModule } from '../courses/courses.module';
import { LessonMaterial, LessonMaterialSchema } from './schemas/lesson-material.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lesson.name, schema: LessonSchema },
      { name: LessonMaterial.name, schema: LessonMaterialSchema }
    ]),
    AuthModule,
    CoursesModule,
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService] // Export service trong trường hợp các Module Courses cần dùng
})
export class LessonsModule {}
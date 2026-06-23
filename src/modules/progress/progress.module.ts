import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ClassesModule } from '../classes/classes.module';
import { Lesson, LessonSchema } from '../lesson/schemas/lesson.schema';
import { UsersModule } from '../users/users.module';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import {
  StudentProgress,
  StudentProgressSchema,
} from './schemas/student-progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudentProgress.name, schema: StudentProgressSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
    // UsersModule export StudentProfile model; ClassesModule export Class + ClassEnrollment model.
    UsersModule,
    ClassesModule,
    AuthModule,
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}

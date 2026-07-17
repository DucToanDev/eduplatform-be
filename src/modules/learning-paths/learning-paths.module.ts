import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LearningPathsController } from './learning-paths.controller';
import { LearningPathsService } from './learning-paths.service';
import { LearningPath, LearningPathSchema } from './schemas/learning-path.schema';
import { StudentProgress, StudentProgressSchema } from '../progress/schemas/student-progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LearningPath.name, schema: LearningPathSchema },
      { name: StudentProgress.name, schema: StudentProgressSchema }
    ])
  ],
  controllers: [LearningPathsController],
  providers: [LearningPathsService],
})
export class LearningPathsModule {}

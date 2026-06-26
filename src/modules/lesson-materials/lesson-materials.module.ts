import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Lesson, LessonSchema } from '../lesson/schemas/lesson.schema';
import { UploadsModule } from '../uploads/uploads.module';
import { LessonMaterialsController } from './lesson-materials.controller';
import { LessonMaterialsService } from './lesson-materials.service';
import {
  LessonMaterial,
  LessonMaterialSchema,
} from './schemas/lesson-material.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LessonMaterial.name, schema: LessonMaterialSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
    UploadsModule,
    AuthModule,
  ],
  controllers: [LessonMaterialsController],
  providers: [LessonMaterialsService],
})
export class LessonMaterialsModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseCategoriesModule } from '../course-categories/course-categories.module';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course, CourseSchema } from './schemas/course.schema';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
    CourseCategoriesModule,
    UploadsModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService, MongooseModule],
})
export class CoursesModule {}

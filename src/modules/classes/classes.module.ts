import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { Class, ClassSchema } from './schemas/class.schema';
import {
  ClassEnrollment,
  ClassEnrollmentSchema,
} from './schemas/class-enrollment.schema';
import { Users, UsersSchema } from '../users/schemas/users.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Class.name, schema: ClassSchema },
      { name: ClassEnrollment.name, schema: ClassEnrollmentSchema },
      { name: Users.name, schema: UsersSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService, MongooseModule],
})
export class ClassesModule {}

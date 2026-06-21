import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Lesson } from '../../lesson/schemas/lesson.schema';
import { Course } from '../../courses/schemas/course.schema';

export type QuizDocument = Quiz & Document;

export enum QuizType {
  LESSON_QUIZ = 'LESSON_QUIZ',
  COURSE_EXAM = 'COURSE_EXAM',
}

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ type: Types.ObjectId, ref: Course.name })
  course_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Lesson.name })
  lesson_id?: Types.ObjectId;

  @Prop({ required: true, enum: QuizType, default: QuizType.LESSON_QUIZ })
  quiz_type: QuizType;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  order_index?: number;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

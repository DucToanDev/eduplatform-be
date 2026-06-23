import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Lesson } from '../../lesson/schemas/lesson.schema';
import { Users } from '../../users/schemas/users.schema';

@Schema({
  collection: 'student_progress',
  timestamps: true,
})
export class StudentProgress {
  @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
  student_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Lesson.name, required: true })
  lesson_id: Types.ObjectId;

  @Prop({ type: Number, default: null })
  score?: number;

  @Prop({ type: Boolean, default: false })
  is_completed: boolean;

  @Prop({ type: Date, default: null })
  completed_at?: Date;
}

export type StudentProgressDocument = HydratedDocument<StudentProgress>;
export const StudentProgressSchema =
  SchemaFactory.createForClass(StudentProgress);

// Mỗi học sinh chỉ có 1 bản ghi tiến độ cho mỗi bài học.
StudentProgressSchema.index({ student_id: 1, lesson_id: 1 }, { unique: true });

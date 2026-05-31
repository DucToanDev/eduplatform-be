import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from './users.schema';

@Schema({
  collection: 'student_profiles',
  timestamps: true,
})
export class StudentProfile {
  @Prop({ type: Types.ObjectId, ref: Users.name, required: true, unique: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
  teacher_id: Types.ObjectId;

  @Prop({ type: Date })
  date_of_birth?: Date;

  @Prop({ type: String, trim: true })
  grade_level?: string;

  @Prop({ type: String, trim: true })
  parent_phone?: string;

  @Prop({ type: Number, default: 0 })
  points: number;

  @Prop({ type: String, trim: true })
  parent_access_codes?: string;
}

export type StudentProfileDocument = HydratedDocument<StudentProfile>;
export const StudentProfileSchema =
  SchemaFactory.createForClass(StudentProfile);

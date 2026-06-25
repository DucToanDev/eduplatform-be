import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from '../../users/schemas/users.schema';
import { Course } from '../../courses/schemas/course.schema';

export enum ClassStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

@Schema({
  collection: 'classes',
  timestamps: true,
})
export class Class {
  @Prop({ required: true, trim: true })
  class_name: string;

  @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
  teacher_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Course.name })
  course_id?: Types.ObjectId;

  @Prop({ type: String, enum: ClassStatus, default: ClassStatus.ACTIVE })
  status: ClassStatus;
}

export type ClassDocument = HydratedDocument<Class>;
export const ClassSchema = SchemaFactory.createForClass(Class);

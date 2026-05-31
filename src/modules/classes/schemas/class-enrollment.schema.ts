import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from '../../users/schemas/users.schema';
import { Class } from './class.schema';

@Schema({
  collection: 'class_enrollments',
  timestamps: { createdAt: 'joined_date', updatedAt: false },
})
export class ClassEnrollment {
  @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
  student_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Class.name, required: true })
  class_id: Types.ObjectId;
}

export type ClassEnrollmentDocument = HydratedDocument<ClassEnrollment>;
export const ClassEnrollmentSchema = SchemaFactory.createForClass(ClassEnrollment);

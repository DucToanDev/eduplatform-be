import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from '../../users/schemas/users.schema';

export enum CourseStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  HIDDEN = 'HIDDEN',
}

@Schema({
  collection: 'courses',
  timestamps: true,
})
export class Course {
  @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
  author_id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '', trim: true })
  description: string;

  @Prop({ default: '', trim: true })
  category: string;

  @Prop({ default: false })
  is_demo: boolean;

  @Prop({ default: false })
  is_marketplace: boolean;

  @Prop({ type: Number, default: 0 })
  price: number;

  @Prop({ type: String, enum: CourseStatus, default: CourseStatus.DRAFT })
  status: CourseStatus;

  @Prop({ default: false })
  is_deleted: boolean;
}

export type CourseDocument = HydratedDocument<Course>;
export const CourseSchema = SchemaFactory.createForClass(Course);

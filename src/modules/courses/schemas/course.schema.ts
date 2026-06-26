import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from '../../users/schemas/users.schema';
import { CourseCategory } from '../../course-categories/schemas/course-category.schema';

export enum CourseStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
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

  @Prop({ default: '' })
  thumbnail_url: string;

  @Prop({ type: Types.ObjectId, ref: CourseCategory.name })
  category?: Types.ObjectId;

  @Prop({ default: false })
  is_demo: boolean;

  @Prop({ default: false })
  is_marketplace: boolean;

  @Prop({ default: 0, min: 0 })
  price: number;

  @Prop({
    type: String,
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ default: '' })
  rejection_reason: string;
}

export type CourseDocument = HydratedDocument<Course>;
export const CourseSchema = SchemaFactory.createForClass(Course);

// Indexes for common query patterns
CourseSchema.index({ author_id: 1, is_deleted: 1, status: 1 });
CourseSchema.index({ category: 1, is_deleted: 1, status: 1 });
CourseSchema.index({ is_marketplace: 1, is_deleted: 1, status: 1 });

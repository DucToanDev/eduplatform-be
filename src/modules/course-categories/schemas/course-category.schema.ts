import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  collection: 'course_categories',
  timestamps: true,
})
export class CourseCategory {
  @Prop({ required: true, trim: true, unique: true })
  name: string;

  @Prop({ default: '', trim: true })
  description: string;

  @Prop({ default: true })
  is_active: boolean;
}

export type CourseCategoryDocument = HydratedDocument<CourseCategory>;
export const CourseCategorySchema =
  SchemaFactory.createForClass(CourseCategory);

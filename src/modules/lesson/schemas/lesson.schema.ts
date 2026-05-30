import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LessonDocument = Lesson & Document;

@Schema({ timestamps: true }) // Tự động có createdAt, updatedAt
export class Lesson {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  content: string;

  @Prop()
  video_url: string;

  @Prop({ default: 0 })
  order_index: number;

  @Prop({ default: false })
  is_deleted: boolean;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LessonDocument = Lesson & Document;

@Schema({ timestamps: true })
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

// Index để tối ưu truy vấn
// Hỗ trợ truy vấn danh sách theo khóa học, đã xóa và sắp xếp
LessonSchema.index({ course_id: 1, is_deleted: 1, order_index: 1 });
// Hỗ trợ truy vấn tất cả khóa học
LessonSchema.index({ is_deleted: 1, order_index: 1 });
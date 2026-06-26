import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LessonDocument = Lesson & Document;

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ type: Types.ObjectId, ref: 'Class', required: true })
  class_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  content: string;

  @Prop()
  video_url: string;

  @Prop({ default: 0 })
  order_index: number;

  @Prop()
  unlock_condition: string;

  @Prop({ default: false })
  is_deleted: boolean;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

LessonSchema.index({ class_id: 1, is_deleted: 1, order_index: 1 });
LessonSchema.index({ is_deleted: 1, order_index: 1 });

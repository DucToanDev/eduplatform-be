import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Lesson } from '../../lesson/schemas/lesson.schema';

export enum MaterialType {
  IMG = 'IMG',
  DOCX = 'DOCX',
  EXCEL = 'EXCEL',
}

@Schema({
  collection: 'lesson_materials',
  timestamps: true,
})
export class LessonMaterial {
  @Prop({ type: Types.ObjectId, ref: Lesson.name, required: true })
  lesson_id: Types.ObjectId;

  @Prop({ type: String, enum: MaterialType, required: true })
  material_type: MaterialType;

  @Prop({ type: String, trim: true })
  url?: string;

  @Prop({ type: String })
  content_data?: string;

  @Prop({ type: Number, default: 0 })
  order_index: number;
}

export type LessonMaterialDocument = HydratedDocument<LessonMaterial>;
export const LessonMaterialSchema =
  SchemaFactory.createForClass(LessonMaterial);

// Tối ưu truy vấn danh sách tài liệu theo bài học và thứ tự hiển thị.
LessonMaterialSchema.index({ lesson_id: 1, order_index: 1 });

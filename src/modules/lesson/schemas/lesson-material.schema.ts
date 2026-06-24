import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Lesson } from './lesson.schema';

export enum MaterialType {
  IMG = 'IMG',
  DOCX = 'DOCX',
  EXCEL = 'EXCEL',
}

export type LessonMaterialDocument = LessonMaterial & Document;

@Schema({ timestamps: true })
export class LessonMaterial {
  @Prop({ type: Types.ObjectId, ref: Lesson.name, required: true })
  lesson_id: Types.ObjectId;

  @Prop({ type: String, enum: MaterialType, required: true })
  material_type: MaterialType;

  @Prop()
  url: string;

  @Prop()
  content_data: string;

  @Prop({ default: 0 })
  order_index: number;
}

export const LessonMaterialSchema = SchemaFactory.createForClass(LessonMaterial);

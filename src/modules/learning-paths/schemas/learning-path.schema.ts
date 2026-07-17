import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LearningPathDocument = LearningPath & Document;

@Schema({ _id: false })
export class LessonRef {
  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true })
  lesson_id: Types.ObjectId;

  @Prop({ required: true })
  order_index: number;
}
const LessonRefSchema = SchemaFactory.createForClass(LessonRef);

@Schema({ _id: false })
export class Stage {
  @Prop({ required: true })
  stage_name: string;

  @Prop({ type: [LessonRefSchema], default: [] })
  lessons: LessonRef[];
}
const StageSchema = SchemaFactory.createForClass(Stage);

@Schema({ timestamps: true })
export class LearningPath {
  @Prop({ type: Types.ObjectId, ref: 'Class', required: true, unique: true })
  class_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ type: [StageSchema], default: [] })
  stages: Stage[];
}

export const LearningPathSchema = SchemaFactory.createForClass(LearningPath);

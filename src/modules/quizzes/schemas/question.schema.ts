import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Quiz } from './quiz.schema';

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {
  @Prop({ type: Types.ObjectId, ref: Quiz.name, required: true })
  quiz_id: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ required: true, type: Number })
  correct_option_index: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

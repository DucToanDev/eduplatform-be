import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Quiz } from './quiz.schema';
import { Users } from '../../users/schemas/users.schema';

export type QuizSubmissionDocument = QuizSubmission & Document;

@Schema({ timestamps: { createdAt: 'submitted_at', updatedAt: false } })
export class QuizSubmission {
  @Prop({ type: Types.ObjectId, ref: Quiz.name, required: true })
  quiz_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
  student_id: Types.ObjectId;

  @Prop({ type: [{ question_id: String, selected_index: Number, is_correct: Boolean }], required: true })
  answers: { question_id: string; selected_index: number; is_correct: boolean }[];

  @Prop({ required: true, type: Number })
  score: number;
}

export const QuizSubmissionSchema = SchemaFactory.createForClass(QuizSubmission);

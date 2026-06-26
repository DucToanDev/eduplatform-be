import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class QuestionRewardConfig {
  @Prop({ type: Types.ObjectId, ref: 'Question', required: true, unique: true })
  question_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  teacher_id: Types.ObjectId;

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  reward_points: number;
}

export type QuestionRewardConfigDocument =
  HydratedDocument<QuestionRewardConfig>;
export const QuestionRewardConfigSchema =
  SchemaFactory.createForClass(QuestionRewardConfig);

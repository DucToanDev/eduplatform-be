import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class LessonRewardConfig {
  @Prop({ type: Types.ObjectId, ref: 'Lessons', required: true, unique: true })
  lesson_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  teacher_id: Types.ObjectId;

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  reward_points: number;
}

export type LessonRewardConfigDocument = HydratedDocument<LessonRewardConfig>;
export const LessonRewardConfigSchema = SchemaFactory.createForClass(LessonRewardConfig);

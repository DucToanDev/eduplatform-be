import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AchievementDocument = Achievement & Document;

@Schema({ timestamps: true })
export class Achievement {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: false })
  badge_url: string;

  @Prop({ required: true, enum: ['QUIZ_SCORE', 'LESSON_COMPLETED', 'LOGIN_STREAK', 'COURSE_COMPLETED'] })
  condition_type: string;

  @Prop({ required: true })
  condition_value: number;

  @Prop({ required: true, default: 0 })
  point_reward: number;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);

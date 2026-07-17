import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudentAchievementDocument = StudentAchievement & Document;

@Schema({ timestamps: true })
export class StudentAchievement {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Achievement', required: true })
  achievement_id: Types.ObjectId;

  @Prop({ default: Date.now })
  unlocked_at: Date;
}

export const StudentAchievementSchema = SchemaFactory.createForClass(StudentAchievement);

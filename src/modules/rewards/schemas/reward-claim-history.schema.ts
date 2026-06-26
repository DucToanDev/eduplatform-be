import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RewardClaimHistory {
  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  student_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  reference_id: Types.ObjectId;

  @Prop({ type: String, required: true, enum: ['QUIZ', 'LESSON'] })
  reference_type: string;
}

export type RewardClaimHistoryDocument = HydratedDocument<RewardClaimHistory>;
export const RewardClaimHistorySchema =
  SchemaFactory.createForClass(RewardClaimHistory);

RewardClaimHistorySchema.index(
  { student_id: 1, reference_id: 1, reference_type: 1 },
  { unique: true },
);

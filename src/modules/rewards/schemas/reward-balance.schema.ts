import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RewardBalance {
  @Prop({ type: Types.ObjectId, ref: 'Users', required: true, unique: true })
  student_id: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  balance: number;
}

export type RewardBalanceDocument = HydratedDocument<RewardBalance>;
export const RewardBalanceSchema = SchemaFactory.createForClass(RewardBalance);

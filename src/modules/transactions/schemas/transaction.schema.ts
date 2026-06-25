import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from '../../users/schemas/users.schema';

export enum TransactionType {
  PAYMENT_TO_ADMIN = 'PAYMENT_TO_ADMIN',
  COMMISSION_FEE = 'COMMISSION_FEE',
  TEACHER_INCOME = 'TEACHER_INCOME',
}

@Schema({
  collection: 'transactions',
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class Transaction {
  @Prop({ type: Types.ObjectId })
  order_id?: Types.ObjectId;

  @Prop({ type: String, enum: TransactionType, required: true })
  transaction_type: TransactionType;

  @Prop({ type: Number, required: true, min: 0 })
  amount: number;

  @Prop({ type: Types.ObjectId, ref: Users.name })
  recipient_id?: Types.ObjectId;

  created_at?: Date;
}

export type TransactionDocument = HydratedDocument<Transaction>;
export const TransactionSchema = SchemaFactory.createForClass(Transaction);

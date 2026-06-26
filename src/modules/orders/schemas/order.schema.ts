import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

export enum OrderReferenceType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  COURSE = 'COURSE',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  BANK = 'BANK',
}

@Schema({
  collection: 'orders',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Order {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Users', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: String, unique: true, sparse: true })
  code: string;

  @Prop({ type: String, enum: OrderReferenceType, required: true })
  reference_type: OrderReferenceType;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  reference_id: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed })
  item_name_snapshot: any;

  @Prop({ type: Number, required: true, min: 0 })
  item_price_snapshot: number;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ type: String, enum: PaymentMethod, default: PaymentMethod.BANK })
  payment_method: PaymentMethod;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Users' })
  seller_id?: Types.ObjectId;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

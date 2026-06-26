import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum StoreItemStatus {
  ACTIVE = 'active',
  SOLDOUT = 'soldout',
}

@Schema({ timestamps: true })
export class StoreItem {
  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  teacher_id: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  type: string;

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: Number, required: true, min: 0 })
  points: number;

  @Prop({ type: Number, required: true, min: 0 })
  stock: number;

  @Prop({ type: Number, default: 0 })
  sold_count: number;

  @Prop({ type: String })
  image_url?: string;

  @Prop({
    type: String,
    enum: StoreItemStatus,
    default: StoreItemStatus.ACTIVE,
  })
  status: string;

  @Prop({ type: Date })
  expired_date?: Date;
}

export type StoreItemDocument = HydratedDocument<StoreItem>;
export const StoreItemSchema = SchemaFactory.createForClass(StoreItem);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class StudentInventory {
  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  student_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'StoreItem', required: true })
  item_id: Types.ObjectId;

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: Number, required: true })
  points: number;

  @Prop({ type: Date, default: Date.now })
  buy_at: Date;

  @Prop({ type: Boolean, default: false })
  active: boolean;
}

export type StudentInventoryDocument = HydratedDocument<StudentInventory>;
export const StudentInventorySchema =
  SchemaFactory.createForClass(StudentInventory);

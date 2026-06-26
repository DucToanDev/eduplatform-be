import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from '../../users/schemas/users.schema';

@Schema({
  collection: 'notifications',
  timestamps: true,
})
export class Notification {
  @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ type: Boolean, default: false })
  is_read: boolean;
}

export type NotificationDocument = HydratedDocument<Notification>;
export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Tối ưu lấy thông báo của một user theo thời gian mới nhất.
NotificationSchema.index({ user_id: 1, createdAt: -1 });

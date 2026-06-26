import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ErrorLogDocument = HydratedDocument<ErrorLog>;

@Schema({
  collection: 'error_logs',
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class ErrorLog {
  @Prop({ required: true })
  statusCode: number;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object })
  details?: any;

  @Prop({ type: String })
  user_id?: string;

  // TTL Index: Tự động xóa document sau 7 ngày (604800 giây)
  @Prop({ type: Date, default: Date.now, expires: 604800 })
  created_at: Date;
}

export const ErrorLogSchema = SchemaFactory.createForClass(ErrorLog);

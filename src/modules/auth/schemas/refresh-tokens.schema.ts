import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({ timestamps: true })
export class RefreshToken {
  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true, type: Date, expires: 0 })
  expires_at: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from '../../users/schemas/users.schema';

export enum CustomFeatureRequestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

@Schema({
  collection: 'custom_feature_requests',
  timestamps: true,
})
export class CustomFeatureRequest {
  @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
  teacher_id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  request_content: string;

  @Prop({ trim: true })
  contact_info?: string;

  @Prop({
    type: String,
    enum: CustomFeatureRequestStatus,
    default: CustomFeatureRequestStatus.PENDING,
  })
  status: CustomFeatureRequestStatus;
}

export type CustomFeatureRequestDocument =
  HydratedDocument<CustomFeatureRequest>;
export const CustomFeatureRequestSchema =
  SchemaFactory.createForClass(CustomFeatureRequest);

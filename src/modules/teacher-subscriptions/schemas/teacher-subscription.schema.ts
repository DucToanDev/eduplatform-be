import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type TeacherSubscriptionDocument = HydratedDocument<TeacherSubscription>;

export enum TeacherSubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELED = 'CANCELED',
  UPGRADED = 'UPGRADED',
}

@Schema({
  collection: 'teacher_subscriptions',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class TeacherSubscription {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Users', required: true })
  teacher_id: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'SubscriptionPackage',
    required: true,
  })
  package_id: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed })
  features_snapshot: any;

  @Prop({ type: Date, required: true })
  start_date: Date;

  @Prop({ type: Date, required: true })
  end_date: Date;

  @Prop({
    type: String,
    enum: TeacherSubscriptionStatus,
    default: TeacherSubscriptionStatus.ACTIVE,
  })
  status: TeacherSubscriptionStatus;
}

export const TeacherSubscriptionSchema =
  SchemaFactory.createForClass(TeacherSubscription);

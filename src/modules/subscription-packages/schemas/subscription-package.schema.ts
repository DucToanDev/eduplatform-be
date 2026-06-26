import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type SubscriptionPackageDocument = HydratedDocument<SubscriptionPackage>;

@Schema({
  collection: 'subscription_packages',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class SubscriptionPackage {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  max_classes: number;

  @Prop({ required: true, min: 0 })
  max_students_per_class: number;

  @Prop({ required: true, default: false })
  can_sell_courses: boolean;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: 0 })
  order_index: number;

  @Prop({ type: MongooseSchema.Types.Mixed })
  features: any;
}

export const SubscriptionPackageSchema =
  SchemaFactory.createForClass(SubscriptionPackage);

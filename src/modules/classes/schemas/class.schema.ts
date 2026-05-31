import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from '../../users/schemas/users.schema';

@Schema({
  collection: 'classes',
  timestamps: true,
})
export class Class {
  @Prop({ required: true, trim: true })
  class_name: string;

  @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
  teacher_id: Types.ObjectId;
}

export type ClassDocument = HydratedDocument<Class>;
export const ClassSchema = SchemaFactory.createForClass(Class);

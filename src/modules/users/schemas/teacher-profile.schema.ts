import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from './users.schema';

@Schema({
  collection: 'teacher_profiles',
  timestamps: true,
})
export class TeacherProfile {
  @Prop({ type: Types.ObjectId, ref: Users.name, required: true, unique: true })
  user_id: Types.ObjectId;

  @Prop({ type: String, trim: true })
  bio?: string;

  @Prop({ type: String, trim: true })
  expertise?: string;
}

export type TeacherProfileDocument = HydratedDocument<TeacherProfile>;
export const TeacherProfileSchema =
  SchemaFactory.createForClass(TeacherProfile);

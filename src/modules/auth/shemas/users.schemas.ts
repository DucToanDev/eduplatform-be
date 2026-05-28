import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

@Schema({
  timestamps: true,
})
export class Users {
  @Prop({ type: String, enum: UserRole, default: UserRole.TEACHER })
  role: UserRole;

  @Prop({ required: true })
  fullname: string;

  @Prop()
  avatar_url: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone!: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Date })
  last_login_at!: Date;
}

export type UsersDocument = HydratedDocument<Users>;
export const UsersSchema = SchemaFactory.createForClass(Users);

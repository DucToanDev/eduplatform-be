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

  @Prop({ required: true, trim: true })
  fullname: string;

  @Prop({
    type: String,
    default:
      'https://ui-avatars.com/api/?name=teacher&background=f97316&color=ffffff&size=128',
  })
  avatar_url: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Boolean, default: true })
  status: boolean;

  @Prop({ type: Date })
  last_login_at?: Date;
}

export type UsersDocument = HydratedDocument<Users>;
export const UsersSchema = SchemaFactory.createForClass(Users);

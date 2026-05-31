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

  @Prop({ type: String, unique: true, sparse: true, trim: true })
  username?: string;

  @Prop({
    type: String,
    default: function (this: any) {
      // tạo ava theo username của user
      const name = this.username ? encodeURIComponent(this.username) : 'User';
      return `https://ui-avatars.com/api/?name=${name}&background=f97316&color=ffffff&size=128`;
    },
  })
  avatar_url: string;

  @Prop({ type: String, enum: ['MALE', 'FEMALE', 'OTHER'] })
  gender?: string;

  @Prop({
    required: false,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
  })
  email?: string;

  @Prop()
  phone?: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String })
  raw_password?: string;

  @Prop({ type: Boolean, default: true })
  status: boolean;

  @Prop({ type: Date })
  last_login_at?: Date;
}

export type UsersDocument = HydratedDocument<Users>;
export const UsersSchema = SchemaFactory.createForClass(Users);

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StudentProfilesController } from './student-profiles.controller';
import { TeacherProfilesController } from './teacher-profiles.controller';
import { UsersAvatarController } from './users-avatar.controller';
import { UsersService } from './users.service';
import { UploadsModule } from '../uploads/uploads.module';
import {
  StudentProfile,
  StudentProfileSchema,
} from './schemas/student-profile.schema';
import {
  TeacherProfile,
  TeacherProfileSchema,
} from './schemas/teacher-profile.schema';
import { Users, UsersSchema } from './schemas/users.schema';

@Module({
  imports: [
    UploadsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES') ?? '1d') as NonNullable<
            JwtModuleOptions['signOptions']
          >['expiresIn'],
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: Users.name, schema: UsersSchema },
      { name: StudentProfile.name, schema: StudentProfileSchema },
      { name: TeacherProfile.name, schema: TeacherProfileSchema },
    ]),
  ],
  controllers: [
    StudentProfilesController,
    TeacherProfilesController,
    UsersAvatarController,
  ],
  providers: [UsersService, JwtAuthGuard],
  exports: [MongooseModule, UsersService],
})
export class UsersModule {}

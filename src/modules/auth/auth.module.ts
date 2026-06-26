import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-tokens.schema';
import { TeacherSubscriptionsModule } from '../teacher-subscriptions/teacher-subscriptions.module';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        const expiresIn = config.get<string>('JWT_EXPIRES_IN') ?? '30m';

        if (!secret) {
          throw new Error('Jwt secret chưa được định nghĩa');
        }

        return {
          secret,
          signOptions: {
            expiresIn: expiresIn as NonNullable<
              JwtModuleOptions['signOptions']
            >['expiresIn'],
          },
        };
      },
    }),
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    UsersModule,
    TeacherSubscriptionsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}

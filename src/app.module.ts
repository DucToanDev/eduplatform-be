import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { TokenRefreshInterceptor } from './modules/auth/interceptors/token-refresh.interceptor';
import { getMongooseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { UsersModule } from './modules/users/users.module';
import { LessonsModule } from './modules/lesson/lessons.module';
import { ClassesModule } from './modules/classes/classes.module';
import { LessonMaterialsModule } from './modules/lesson-materials/lesson-materials.module';
import { ProgressModule } from './modules/progress/progress.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getMongooseConfig,
    }),
    UsersModule,
    AuthModule,
    UploadsModule,
    LessonsModule,
    ClassesModule,
    LessonMaterialsModule,
    ProgressModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TokenRefreshInterceptor,
    },
  ],
})
export class AppModule {}

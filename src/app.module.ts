import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { getMongooseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { UsersModule } from './modules/users/users.module';
import { LessonsModule } from './modules/lesson/lessons.module';
import { ClassesModule } from './modules/classes/classes.module';
import { CoursesModule } from './modules/courses/courses.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { CustomFeatureRequestsModule } from './modules/custom-feature-requests/custom-feature-requests.module';
import { ReportsModule } from './modules/reports/reports.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { CourseCategoriesModule } from './modules/course-categories/course-categories.module';
import { RewardsModule } from './modules/rewards/rewards.module';

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
    CoursesModule,
    QuizzesModule,
    TransactionsModule,
    ReportsModule,
    CustomFeatureRequestsModule,
    CourseCategoriesModule,
    RewardsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { getCorsConfig } from './config/cors.config';
import configSwagger from './config/Swagger.config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { MongoExceptionFilter } from './common/filters/mongo-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ErrorLogsService } from './modules/error-logs/error-logs.service';
import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(getCorsConfig());
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  // Thứ tự filter quan trọng: AllExceptionsFilter bọc ngoài cùng, sau đó đến MongoExceptionFilter
  const errorLogsService = app.get(ErrorLogsService);
  app.useGlobalFilters(new AllExceptionsFilter(errorLogsService), new MongoExceptionFilter(errorLogsService));
  configSwagger(app);
  const server = app.getHttpServer();
  server.keepAliveTimeout = 65000; // 65 giây
  server.headersTimeout = 66000; // Lớn hơn keepAliveTimeout một chút

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

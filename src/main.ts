import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { getCorsConfig } from './config/cors.config';
import configSwagger from './config/Swagger.config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
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
  configSwagger(app);
  const server = app.getHttpServer();
  server.keepAliveTimeout = 65000; // 65 giây
  server.headersTimeout = 66000; // Lớn hơn keepAliveTimeout một chút

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

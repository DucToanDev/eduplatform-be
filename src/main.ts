import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { getCorsConfig } from './config/cors.config';
import configSwagger from './config/Swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(getCorsConfig());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  configSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

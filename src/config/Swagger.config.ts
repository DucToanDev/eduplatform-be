import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const configSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('API Edu Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // CHỈ CẦN SETUP MỘT LẦN
  SwaggerModule.setup('doc-ui', app, document, {
    jsonDocumentUrl: 'doc-json',
    yamlDocumentUrl: 'doc-yaml',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
};

export default configSwagger;

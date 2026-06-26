import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersDocument } from './src/modules/users/schemas/users.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<UsersDocument>>(getModelToken('Users'));
  
  try {
    await userModel.collection.dropIndex('email_1');
    console.log('Dropped old email_1 index');
  } catch (e) {
    console.log('Index email_1 might not exist or already dropped:', e.message);
  }

  try {
    await userModel.syncIndexes();
    console.log('Re-synced indexes with sparse: true');
  } catch (e) {
    console.log('Error syncing indexes:', e.message);
  }

  await app.close();
}
bootstrap();

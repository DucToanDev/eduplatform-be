import { ConfigService } from '@nestjs/config';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';

export const getMongooseConfig = (
  configService: ConfigService,
): MongooseModuleFactoryOptions => {
  const uri = configService.get<string>('DB_CONNECTION');

  if (!uri) {
    throw new Error('Lỗi kết nối tới cơ sở dữ liệu');
  }

  return { uri };
};

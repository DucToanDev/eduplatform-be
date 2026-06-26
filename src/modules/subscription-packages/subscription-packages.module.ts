import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionPackagesService } from './subscription-packages.service';
import { SubscriptionPackagesController } from './subscription-packages.controller';
import {
  SubscriptionPackage,
  SubscriptionPackageSchema,
} from './schemas/subscription-package.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubscriptionPackage.name, schema: SubscriptionPackageSchema },
    ]),
  ],
  providers: [SubscriptionPackagesService],
  controllers: [SubscriptionPackagesController],
  exports: [SubscriptionPackagesService],
})
export class SubscriptionPackagesModule {}

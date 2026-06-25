import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CustomFeatureRequest,
  CustomFeatureRequestSchema,
} from './schemas/custom-feature-request.schema';
import { CustomFeatureRequestsController } from './custom-feature-requests.controller';
import { CustomFeatureRequestsService } from './custom-feature-requests.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CustomFeatureRequest.name,
        schema: CustomFeatureRequestSchema,
      },
    ]),
  ],
  controllers: [CustomFeatureRequestsController],
  providers: [CustomFeatureRequestsService],
})
export class CustomFeatureRequestsModule {}

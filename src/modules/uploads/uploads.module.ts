import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { CloudinaryProvider } from './providers/cloudinary.provider';

@Module({
  providers: [CloudinaryProvider, UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}

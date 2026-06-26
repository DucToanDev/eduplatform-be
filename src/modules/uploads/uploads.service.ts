import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { CLOUDINARY } from './providers/cloudinary.provider';

@Injectable()
export class UploadsService {
  constructor(
    @Inject(CLOUDINARY)
    private readonly cloudinaryClient: typeof cloudinary,
  ) {}

  uploadImage(
    file: Express.Multer.File,
    folder = 'edu-platform/avatars',
  ): Promise<UploadApiResponse> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn ảnh để upload');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File upload phải là ảnh');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinaryClient.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new BadRequestException('Upload ảnh thất bại'));
            return;
          }

          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  // Upload file bất kỳ (ảnh, docx, excel, pdf...) lên Cloudinary.
  // resource_type 'auto' để Cloudinary tự nhận diện ảnh hay file thô (raw).
  uploadFile(
    file: Express.Multer.File,
    folder = 'edu-platform/lesson-materials',
  ): Promise<UploadApiResponse> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file để upload');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinaryClient.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new BadRequestException('Upload file thất bại'));
            return;
          }

          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson, LessonDocument } from '../lesson/schemas/lesson.schema';
import { UploadsService } from '../uploads/uploads.service';
import { CreateLessonMaterialDto } from './dto/create-lesson-material.dto';
import { UpdateLessonMaterialDto } from './dto/update-lesson-material.dto';
import {
  LessonMaterial,
  LessonMaterialDocument,
} from './schemas/lesson-material.schema';

const MATERIAL_UPLOAD_FOLDER = 'edu-platform/lesson-materials';

@Injectable()
export class LessonMaterialsService {
  constructor(
    @InjectModel(LessonMaterial.name)
    private readonly materialModel: Model<LessonMaterialDocument>,
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
    private readonly uploadsService: UploadsService,
  ) {}

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID không hợp lệ: ${id}`);
    }
  }

  private async ensureLessonExists(lessonId: string): Promise<void> {
    const exists = await this.lessonModel.exists({
      _id: lessonId,
      is_deleted: false,
    });

    if (!exists) {
      throw new NotFoundException('Không tìm thấy bài học');
    }
  }

  async create(dto: CreateLessonMaterialDto, file?: Express.Multer.File) {
    this.validateObjectId(dto.lesson_id);
    await this.ensureLessonExists(dto.lesson_id);

    let url: string | undefined;
    if (file) {
      const uploadResult = await this.uploadsService.uploadFile(
        file,
        MATERIAL_UPLOAD_FOLDER,
      );
      url = uploadResult.secure_url;
    }

    if (!url && !dto.content_data) {
      throw new BadRequestException(
        'Cần cung cấp file để upload hoặc nội dung văn bản (content_data)',
      );
    }

    const orderIndex =
      dto.order_index ??
      (await this.materialModel.countDocuments({
        lesson_id: new Types.ObjectId(dto.lesson_id),
      }));

    const material = await this.materialModel.create({
      lesson_id: new Types.ObjectId(dto.lesson_id),
      material_type: dto.material_type,
      url,
      content_data: dto.content_data,
      order_index: orderIndex,
    });

    return {
      message: 'Thêm tài liệu cho bài học thành công',
      data: material,
    };
  }

  async findByLesson(lessonId: string): Promise<LessonMaterial[]> {
    this.validateObjectId(lessonId);

    return this.materialModel
      .find({ lesson_id: new Types.ObjectId(lessonId) })
      .sort({ order_index: 1 })
      .exec();
  }

  async findOne(id: string): Promise<LessonMaterial> {
    this.validateObjectId(id);

    const material = await this.materialModel.findById(id).exec();
    if (!material) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

    return material;
  }

  async update(id: string, dto: UpdateLessonMaterialDto) {
    this.validateObjectId(id);

    const material = await this.materialModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .exec();

    if (!material) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

    return {
      message: 'Cập nhật tài liệu thành công',
      data: material,
    };
  }

  async remove(id: string) {
    this.validateObjectId(id);

    const deleted = await this.materialModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

    return {
      message: 'Xóa tài liệu khỏi bài học thành công',
    };
  }

  async reorder(lessonId: string, orderedIds: string[]) {
    this.validateObjectId(lessonId);
    await this.ensureLessonExists(lessonId);

    const operations = orderedIds.map((materialId, index) => ({
      updateOne: {
        filter: {
          _id: new Types.ObjectId(materialId),
          lesson_id: new Types.ObjectId(lessonId),
        },
        update: { $set: { order_index: index } },
      },
    }));

    if (operations.length > 0) {
      await this.materialModel.bulkWrite(operations);
    }

    return {
      message: 'Sắp xếp thứ tự tài liệu thành công',
      data: await this.findByLesson(lessonId),
    };
  }
}

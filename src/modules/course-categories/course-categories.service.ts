import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCourseCategoryDto } from './dto/create-course-category.dto';
import { UpdateCourseCategoryDto } from './dto/update-course-category.dto';
import {
  CourseCategory,
  CourseCategoryDocument,
} from './schemas/course-category.schema';

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

@Injectable()
export class CourseCategoriesService {
  constructor(
    @InjectModel(CourseCategory.name)
    private readonly categoryModel: Model<CourseCategoryDocument>,
  ) {}

  async create(dto: CreateCourseCategoryDto): Promise<CourseCategory> {
    try {
      return await this.categoryModel.create({
        ...dto,
        is_active: true,
      });
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('Danh mục khóa học đã tồn tại');
      }
      throw error;
    }
  }

  async findAll(includeDisabled = false): Promise<CourseCategory[]> {
    return this.categoryModel
      .find(includeDisabled ? {} : { is_active: true })
      .sort({ name: 1 })
      .exec();
  }

  async update(
    id: string,
    dto: UpdateCourseCategoryDto,
  ): Promise<CourseCategoryDocument> {
    this.validateObjectId(id);

    try {
      const category = await this.categoryModel.findByIdAndUpdate(id, dto, {
        returnDocument: 'after',
        runValidators: true,
      });

      if (!category) {
        throw new NotFoundException('Không tìm thấy danh mục khóa học');
      }

      return category;
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('Danh mục khóa học đã tồn tại');
      }
      throw error;
    }
  }

  async disable(id: string): Promise<CourseCategoryDocument> {
    this.validateObjectId(id);

    const category = await this.categoryModel.findByIdAndUpdate(
      id,
      { is_active: false },
      { returnDocument: 'after', runValidators: true },
    );

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục khóa học');
    }

    return category;
  }

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }
  }
}

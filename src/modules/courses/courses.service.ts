import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  buildPaginatedResponse,
  getPaginationSkip,
} from '../../common/utils/pagination.util';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import {
  CourseCategory,
  CourseCategoryDocument,
} from '../course-categories/schemas/course-category.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseQueryDto } from './dto/course-query.dto';
import { UpdateCourseStatusDto } from './dto/update-course-status.dto';
import { Course, CourseDocument, CourseStatus } from './schemas/course.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(CourseCategory.name)
    private readonly categoryModel: Model<CourseCategoryDocument>,
  ) {}

  async create(
    dto: CreateCourseDto,
    authorId: string,
  ): Promise<CourseDocument> {
    this.validateObjectId(authorId);

    if (dto.category) {
      await this.validateCategoryExists(dto.category);
    }

    const course = await this.courseModel.create({
      ...dto,
      author_id: new Types.ObjectId(authorId),
      category: dto.category ? new Types.ObjectId(dto.category) : undefined,
      status: CourseStatus.DRAFT,
    });

    return course;
  }

  async findAll(
    query: CourseQueryDto,
  ): Promise<PaginatedResponse<CourseDocument>> {
    const filter = this.buildCourseFilter(query);

    const [data, total] = await Promise.all([
      this.courseModel
        .find(filter)
        .populate('author_id', 'fullname avatar_url')
        .populate('category', 'name')
        .sort({ createdAt: -1, _id: -1 })
        .skip(getPaginationSkip(query))
        .limit(query.limit)
        .exec(),
      this.courseModel.countDocuments(filter),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  async findOne(id: string): Promise<CourseDocument> {
    this.validateObjectId(id);

    const course = await this.courseModel
      .findOne({ _id: id, is_deleted: false })
      .populate('author_id', 'fullname avatar_url email')
      .populate('category', 'name description')
      .exec();

    if (!course) {
      throw new NotFoundException('Không tìm thấy khóa học');
    }

    return course;
  }

  async update(
    id: string,
    dto: UpdateCourseDto,
    authorId: string,
  ): Promise<CourseDocument> {
    this.validateObjectId(id);
    this.validateObjectId(authorId);

    if (dto.category) {
      await this.validateCategoryExists(dto.category);
    }

    const updatePayload: Record<string, unknown> = { ...dto };
    if (dto.category) {
      updatePayload.category = new Types.ObjectId(dto.category);
    }

    const course = await this.courseModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        author_id: new Types.ObjectId(authorId),
        is_deleted: false,
      },
      { $set: updatePayload },
      { new: true, runValidators: true },
    );

    if (!course) {
      throw new NotFoundException(
        'Không tìm thấy khóa học hoặc bạn không có quyền cập nhật',
      );
    }

    return course;
  }

  async remove(id: string, authorId: string): Promise<{ message: string }> {
    this.validateObjectId(id);
    this.validateObjectId(authorId);

    const course = await this.courseModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        author_id: new Types.ObjectId(authorId),
        is_deleted: false,
      },
      { $set: { is_deleted: true } },
      { new: true },
    );

    if (!course) {
      throw new NotFoundException(
        'Không tìm thấy khóa học hoặc bạn không có quyền xóa',
      );
    }

    return { message: 'Xóa khóa học thành công' };
  }

  async findByAuthor(
    authorId: string,
    query: CourseQueryDto,
  ): Promise<PaginatedResponse<CourseDocument>> {
    this.validateObjectId(authorId);

    const filter: Record<string, unknown> = {
      author_id: new Types.ObjectId(authorId),
      is_deleted: false,
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.category) {
      this.validateObjectId(query.category);
      filter.category = new Types.ObjectId(query.category);
    }

    if (query.search) {
      filter.title = new RegExp(query.search, 'i');
    }

    const [data, total] = await Promise.all([
      this.courseModel
        .find(filter)
        .populate('category', 'name')
        .sort({ createdAt: -1, _id: -1 })
        .skip(getPaginationSkip(query))
        .limit(query.limit)
        .exec(),
      this.courseModel.countDocuments(filter),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  async updateStatus(
    id: string,
    dto: UpdateCourseStatusDto,
  ): Promise<CourseDocument> {
    this.validateObjectId(id);

    const updatePayload: Record<string, unknown> = {
      status: dto.status,
    };

    if (dto.status === CourseStatus.REJECTED) {
      updatePayload.rejection_reason = dto.rejection_reason || '';
    }

    // Khi publish/approve thì xóa rejection_reason cũ
    if (
      dto.status === CourseStatus.PUBLISHED ||
      dto.status === CourseStatus.PENDING_APPROVAL
    ) {
      updatePayload.rejection_reason = '';
    }

    const course = await this.courseModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        is_deleted: false,
      },
      { $set: updatePayload },
      { new: true, runValidators: true },
    );

    if (!course) {
      throw new NotFoundException('Không tìm thấy khóa học');
    }

    return course;
  }

  private buildCourseFilter(query: CourseQueryDto): Record<string, unknown> {
    const filter: Record<string, unknown> = {
      is_deleted: false,
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.category) {
      this.validateObjectId(query.category);
      filter.category = new Types.ObjectId(query.category);
    }

    if (query.is_marketplace !== undefined) {
      if (query.is_marketplace !== 'true' && query.is_marketplace !== 'false') {
        throw new BadRequestException('is_marketplace phải là true hoặc false');
      }
      filter.is_marketplace = query.is_marketplace === 'true';
    }

    if (query.author_id) {
      this.validateObjectId(query.author_id);
      filter.author_id = new Types.ObjectId(query.author_id);
    }

    if (query.search) {
      filter.title = new RegExp(query.search, 'i');
    }

    return filter;
  }

  private async validateCategoryExists(categoryId: string): Promise<void> {
    this.validateObjectId(categoryId);

    const category = await this.categoryModel.findOne({
      _id: new Types.ObjectId(categoryId),
      is_active: true,
    });

    if (!category) {
      throw new NotFoundException(
        'Danh mục khóa học không tồn tại hoặc đã bị vô hiệu hóa',
      );
    }
  }

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID không hợp lệ: ${id}`);
    }
  }
}

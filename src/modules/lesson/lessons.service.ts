import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import {
  buildPaginatedResponse,
  getPaginationSkip,
} from '../../common/utils/pagination.util';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson, LessonDocument } from './schemas/lesson.schema';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const newLesson = new this.lessonModel(createLessonDto);
    return newLesson.save();
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Lesson>> {
    return this.findPaginated({ is_deleted: false }, paginationQuery);
  }

  async findByCourse(
    courseId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Lesson>> {
    this.validateObjectId(courseId);

    return this.findPaginated(
      {
        course_id: new Types.ObjectId(courseId),
        is_deleted: false,
      },
      paginationQuery,
    );
  }

  async findOne(id: string): Promise<Lesson> {
    this.validateObjectId(id);

    const lesson = await this.lessonModel
      .findOne({ _id: id, is_deleted: false })
      .exec();

    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học với ID #${id}`);
    }

    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    this.validateObjectId(id);

    const updatedLesson = await this.lessonModel
      .findOneAndUpdate({ _id: id, is_deleted: false }, updateLessonDto, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedLesson) {
      throw new NotFoundException(
        `Không tìm thấy bài học với ID #${id} để cập nhật`,
      );
    }

    return updatedLesson;
  }

  async remove(id: string): Promise<void> {
    this.validateObjectId(id);

    const result = await this.lessonModel
      .findOneAndUpdate(
        { _id: id, is_deleted: false },
        { is_deleted: true },
        { new: true },
      )
      .exec();

    if (!result) {
      throw new NotFoundException(
        `Không tìm thấy bài học với ID #${id} để xóa`,
      );
    }
  }

  private async findPaginated(
    filter: Record<string, unknown>,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Lesson>> {
    const skip = getPaginationSkip(paginationQuery);

    const [data, total] = await Promise.all([
      this.lessonModel
        .find(filter)
        .select('-content')
        .sort({ order_index: 1 })
        .skip(skip)
        .limit(paginationQuery.limit)
        .exec(),
      this.lessonModel.countDocuments(filter),
    ]);

    return buildPaginatedResponse(data, total, paginationQuery);
  }

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }
  }
}

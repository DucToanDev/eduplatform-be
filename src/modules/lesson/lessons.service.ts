import {
  BadRequestException,
  ForbiddenException,
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
import { ClassesService } from '../classes/classes.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson, LessonDocument } from './schemas/lesson.schema';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
    private readonly classesService: ClassesService,
  ) {}

  async checkClassOwnership(classId: string, teacherId: string) {
    const classDoc = await this.classesService.findOne(classId);
    if (classDoc.teacher_id.toString() !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền thao tác trên bài học của lớp học này');
    }
  }

  async create(createLessonDto: CreateLessonDto, teacherId: string): Promise<Lesson> {
    await this.checkClassOwnership(createLessonDto.class_id.toString(), teacherId);
    const newLesson = new this.lessonModel(createLessonDto);
    return newLesson.save();
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Lesson>> {
    return this.findPaginated({ is_deleted: false }, paginationQuery);
  }

  async findByClass(
    classId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Lesson>> {
    this.validateObjectId(classId);

    return this.findPaginated(
      {
        class_id: new Types.ObjectId(classId),
        is_deleted: false,
      },
      paginationQuery,
    );
  }

  async findAllIdsByClass(classId: string): Promise<string[]> {
    this.validateObjectId(classId);
    const lessons = await this.lessonModel
      .find({ class_id: new Types.ObjectId(classId), is_deleted: false })
      .select('_id')
      .exec();
    return lessons.map(l => l._id.toString());
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

  async update(id: string, updateLessonDto: UpdateLessonDto, teacherId: string): Promise<Lesson> {
    this.validateObjectId(id);
    const lessonToUpdate = await this.findOne(id);
    await this.checkClassOwnership(lessonToUpdate.class_id.toString(), teacherId);

    const updatedLesson = await this.lessonModel
      .findOneAndUpdate({ _id: id, is_deleted: false }, updateLessonDto, {
        returnDocument: 'after',
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

  async remove(id: string, teacherId: string): Promise<void> {
    this.validateObjectId(id);
    const lessonToRemove = await this.findOne(id);
    await this.checkClassOwnership(lessonToRemove.class_id.toString(), teacherId);

    const result = await this.lessonModel
      .findOneAndUpdate(
        { _id: id, is_deleted: false },
        { is_deleted: true },
        { returnDocument: 'after' },
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

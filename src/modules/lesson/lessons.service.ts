import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { CoursesService } from '../courses/courses.service';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private readonly lessonModel: Model<LessonDocument>,
    private readonly coursesService: CoursesService,
  ) {}

  async checkCourseOwnership(courseId: string, authorId: string) {
    const course = await this.coursesService.findOne(courseId);
    if (course.author_id.toString() !== authorId) {
      throw new ForbiddenException('Bạn không có quyền thao tác trên bài học của khóa học này');
    }
  }

  async create(createLessonDto: CreateLessonDto, authorId: string): Promise<Lesson> {
    await this.checkCourseOwnership(createLessonDto.course_id.toString(), authorId);
    const newLesson = new this.lessonModel(createLessonDto);
    return newLesson.save();
  }

  async findAll(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.lessonModel
        .find({ is_deleted: false })
        .select('-content') // Tối ưu: Không trả về content quá dài ở danh sách
        .sort({ order_index: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.lessonModel.countDocuments({ is_deleted: false })
    ]);
    return { data, total, page: Number(page), limit: Number(limit) };
  }

  async findByCourse(courseId: string, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.lessonModel
        .find({ course_id: courseId, is_deleted: false })
        .select('-content') // Tối ưu: Không trả về content quá dài ở danh sách
        .sort({ order_index: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.lessonModel.countDocuments({ course_id: courseId, is_deleted: false })
    ]);
    return { data, total, page: Number(page), limit: Number(limit) };
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonModel.findOne({ _id: id, is_deleted: false }).exec();
    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học với ID #${id}`);
    }
    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto, authorId: string): Promise<Lesson> {
    const lessonToUpdate = await this.findOne(id);
    await this.checkCourseOwnership(lessonToUpdate.course_id.toString(), authorId);

    const updatedLesson = await this.lessonModel
      .findByIdAndUpdate(id, updateLessonDto, { new: true })
      .exec();
      
    if (!updatedLesson) {
      throw new NotFoundException(`Không tìm thấy bài học với ID #${id} để cập nhật`);
    }
    return updatedLesson;
  }

  async remove(id: string, authorId: string): Promise<void> {
    const lessonToRemove = await this.findOne(id);
    await this.checkCourseOwnership(lessonToRemove.course_id.toString(), authorId);

    const result = await this.lessonModel.findOneAndUpdate(
      { _id: id, is_deleted: false },
      { is_deleted: true },
      { new: true },
    ).exec();
    if (!result) {
      throw new NotFoundException(`Không tìm thấy bài học với ID #${id} để xóa`);
    }
  }
}
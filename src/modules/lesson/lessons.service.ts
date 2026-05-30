import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private readonly lessonModel: Model<LessonDocument>,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const newLesson = new this.lessonModel(createLessonDto);
    return newLesson.save();
  }

  async findAll(): Promise<Lesson[]> {
    return this.lessonModel.find({ is_deleted: false }).sort({ order_index: 1 }).exec();
  }

  async findByCourse(courseId: string): Promise<Lesson[]> {
    return this.lessonModel
      .find({ course_id: courseId, is_deleted: false })
      .sort({ order_index: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonModel.findOne({ _id: id, is_deleted: false }).exec();
    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học với ID #${id}`);
    }
    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const updatedLesson = await this.lessonModel
      .findByIdAndUpdate(id, updateLessonDto, { new: true })
      .exec();
      
    if (!updatedLesson) {
      throw new NotFoundException(`Không tìm thấy bài học với ID #${id} để cập nhật`);
    }
    return updatedLesson;
  }

  async remove(id: string): Promise<void> {
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
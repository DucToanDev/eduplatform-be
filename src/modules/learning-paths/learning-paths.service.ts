import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LearningPath, LearningPathDocument } from './schemas/learning-path.schema';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { UpdateLearningPathDto } from './dto/update-learning-path.dto';
import { StudentProgress, StudentProgressDocument } from '../progress/schemas/student-progress.schema';

@Injectable()
export class LearningPathsService {
  constructor(
    @InjectModel(LearningPath.name) private learningPathModel: Model<LearningPathDocument>,
    @InjectModel(StudentProgress.name) private studentProgressModel: Model<StudentProgressDocument>,
  ) {}

  async create(createDto: CreateLearningPathDto) {
    if (!Types.ObjectId.isValid(createDto.class_id)) throw new BadRequestException('ID lớp học không hợp lệ');
    const existing = await this.learningPathModel.findOne({ class_id: new Types.ObjectId(createDto.class_id) });
    if (existing) throw new BadRequestException('Lớp học này đã có lộ trình học');
    
    return new this.learningPathModel({
      ...createDto,
      class_id: new Types.ObjectId(createDto.class_id)
    }).save();
  }

  async update(id: string, updateDto: UpdateLearningPathDto) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('ID lộ trình không hợp lệ');
    return this.learningPathModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  async getPathForClass(classId: string, studentId: string) {
    if (!Types.ObjectId.isValid(classId)) throw new BadRequestException('ID lớp học không hợp lệ');

    const path = await this.learningPathModel
      .findOne({ class_id: new Types.ObjectId(classId) })
      .populate('stages.lessons.lesson_id', 'title type duration')
      .lean()
      .exec();

    if (!path) throw new NotFoundException('Lớp học chưa có lộ trình');

    if (!studentId) return path;

    const lessonIds = path.stages.flatMap(stage => stage.lessons.map(l => (l as any).lesson_id._id));
    const progressRecords = await this.studentProgressModel.find({
      student_id: new Types.ObjectId(studentId),
      lesson_id: { $in: lessonIds }
    }).lean().exec();

    const progressMap = new Map();
    progressRecords.forEach(record => progressMap.set(record.lesson_id.toString(), record));

    path.stages = path.stages.map(stage => {
      stage.lessons = stage.lessons.map(lesson => {
        const lid = (lesson as any).lesson_id._id.toString();
        const progress = progressMap.get(lid);
        return {
          ...lesson,
          progress: progress ? {
            is_completed: progress.is_completed,
            score: progress.score,
            completed_at: progress.completed_at
          } : null
        };
      }) as any;
      return stage;
    });

    return path;
  }
}

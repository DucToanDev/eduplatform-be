import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ClassEnrollment,
  ClassEnrollmentDocument,
} from '../classes/schemas/class-enrollment.schema';
import { Class, ClassDocument } from '../classes/schemas/class.schema';
import { Lesson, LessonDocument } from '../lesson/schemas/lesson.schema';
import {
  StudentProfile,
  StudentProfileDocument,
} from '../users/schemas/student-profile.schema';
import { CreateProgressDto } from './dto/create-progress.dto';
import {
  StudentProgress,
  StudentProgressDocument,
} from './schemas/student-progress.schema';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(StudentProgress.name)
    private readonly progressModel: Model<StudentProgressDocument>,
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
    @InjectModel(StudentProfile.name)
    private readonly studentProfileModel: Model<StudentProfileDocument>,
    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,
    @InjectModel(ClassEnrollment.name)
    private readonly classEnrollmentModel: Model<ClassEnrollmentDocument>,
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

  private async getLessonIdsByCourse(
    courseId: string,
  ): Promise<Types.ObjectId[]> {
    this.validateObjectId(courseId);

    const lessons = await this.lessonModel
      .find({ course_id: new Types.ObjectId(courseId), is_deleted: false })
      .select('_id')
      .exec();

    return lessons.map((lesson) => lesson._id);
  }

  // Học sinh hiện tại tạo mới hoặc cập nhật tiến độ của chính mình cho một bài học.
  async upsertOwnProgress(studentId: string, dto: CreateProgressDto) {
    this.validateObjectId(dto.lesson_id);
    await this.ensureLessonExists(dto.lesson_id);

    const update: Record<string, unknown> = {};
    if (dto.score !== undefined) {
      update.score = dto.score;
    }
    if (dto.is_completed !== undefined) {
      update.is_completed = dto.is_completed;
      update.completed_at = dto.is_completed ? new Date() : null;
    }

    const progress = await this.progressModel.findOneAndUpdate(
      {
        student_id: new Types.ObjectId(studentId),
        lesson_id: new Types.ObjectId(dto.lesson_id),
      },
      Object.keys(update).length > 0 ? { $set: update } : {},
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    );

    return {
      message: 'Cập nhật tiến độ học tập thành công',
      data: progress,
    };
  }

  // Học sinh cập nhật trạng thái hoàn thành cho bản ghi tiến độ của chính mình.
  async updateCompletion(id: string, studentId: string, isCompleted: boolean) {
    this.validateObjectId(id);

    const progress = await this.progressModel.findById(id);
    if (!progress) {
      throw new NotFoundException('Không tìm thấy bản ghi tiến độ');
    }

    if (String(progress.student_id) !== studentId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật tiến độ này');
    }

    progress.is_completed = isCompleted;
    progress.completed_at = isCompleted ? new Date() : undefined;
    await progress.save();

    return {
      message: 'Cập nhật trạng thái hoàn thành thành công',
      data: progress,
    };
  }

  async getOwnProgress(studentId: string): Promise<StudentProgress[]> {
    return this.progressModel
      .find({ student_id: new Types.ObjectId(studentId) })
      .populate('lesson_id', 'title order_index class_id')
      .exec();
  }

  async getOwnProgressByCourse(
    studentId: string,
    courseId: string,
  ): Promise<StudentProgress[]> {
    const lessonIds = await this.getLessonIdsByCourse(courseId);

    return this.progressModel
      .find({
        student_id: new Types.ObjectId(studentId),
        lesson_id: { $in: lessonIds },
      })
      .populate('lesson_id', 'title order_index class_id')
      .exec();
  }

  // Giáo viên xem tiến độ học sinh trong một lớp (chỉ lớp của chính mình),
  // có thể lọc thêm theo khóa học qua query courseId.
  async getClassProgressForTeacher(
    classId: string,
    teacherId: string,
    courseId?: string,
  ): Promise<StudentProgress[]> {
    this.validateObjectId(classId);

    const targetClass = await this.classModel.findOne({
      _id: new Types.ObjectId(classId),
      teacher_id: new Types.ObjectId(teacherId),
    });

    if (!targetClass) {
      throw new NotFoundException(
        'Không tìm thấy lớp học hoặc bạn không có quyền xem',
      );
    }

    const enrollments = await this.classEnrollmentModel.find({
      class_id: new Types.ObjectId(classId),
    });
    const studentIds = enrollments.map((enrollment) => enrollment.student_id);

    const filter: Record<string, unknown> = {
      student_id: { $in: studentIds },
    };

    if (courseId) {
      filter.lesson_id = { $in: await this.getLessonIdsByCourse(courseId) };
    }

    return this.progressModel
      .find(filter)
      .populate('student_id', 'fullname username avatar_url')
      .populate('lesson_id', 'title order_index class_id')
      .exec();
  }

  // Giáo viên chấm điểm cho một bản ghi tiến độ (chỉ học sinh do mình quản lý).
  async updateScore(id: string, teacherId: string, score: number) {
    this.validateObjectId(id);

    const progress = await this.progressModel.findById(id);
    if (!progress) {
      throw new NotFoundException('Không tìm thấy bản ghi tiến độ');
    }

    const profile = await this.studentProfileModel.findOne({
      user_id: progress.student_id,
    });

    if (!profile || String(profile.teacher_id) !== teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền chấm điểm cho học sinh này',
      );
    }

    progress.score = score;
    await progress.save();

    return {
      message: 'Cập nhật điểm thành công',
      data: progress,
    };
  }
}

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { Users, UsersDocument, UserRole } from '../users/schemas/users.schema';
import { AddStudentToClassDto } from './dto/add-student-to-class.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { Class, ClassDocument } from './schemas/class.schema';
import {
  ClassEnrollment,
  ClassEnrollmentDocument,
} from './schemas/class-enrollment.schema';

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

type CurrentUser = {
  id: string;
  role: UserRole;
};

type EnrollmentWithStudent = ClassEnrollmentDocument & {
  student_id: UsersDocument;
};

type EnrollmentWithClass = ClassEnrollmentDocument & {
  class_id: ClassDocument;
};

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,
    @InjectModel(ClassEnrollment.name)
    private readonly classEnrollmentModel: Model<ClassEnrollmentDocument>,
    @InjectModel(Users.name)
    private readonly userModel: Model<UsersDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  async createClass(dto: CreateClassDto, teacherId: string) {
    this.validateObjectId(teacherId);
    await this.validateCourseOwnership(dto.course_id, teacherId);

    const newClass = await this.classModel.create({
      class_name: dto.class_name,
      teacher_id: new Types.ObjectId(teacherId),
      course_id: dto.course_id ? new Types.ObjectId(dto.course_id) : undefined,
      status: dto.status,
    });

    return {
      message: 'Tạo lớp học thành công',
      data: newClass,
    };
  }

  async getClassesByTeacher(teacherId: string) {
    this.validateObjectId(teacherId);
    return this.classModel
      .find({ teacher_id: new Types.ObjectId(teacherId) })
      .populate('course_id', 'title category status')
      .exec();
  }

  async getClassDetail(id: string, currentUser: CurrentUser) {
    const classDoc = await this.findClassDocument(id);
    await this.assertCanViewClass(classDoc, currentUser);
    return classDoc.populate([
      { path: 'teacher_id', select: 'fullname email avatar_url' },
      { path: 'course_id', select: 'title category status' },
    ]);
  }

  async updateClass(id: string, dto: UpdateClassDto, teacherId: string) {
    this.validateObjectId(id);
    this.validateObjectId(teacherId);
    await this.validateCourseOwnership(dto.course_id, teacherId);

    const updatePayload = {
      ...dto,
      course_id: dto.course_id ? new Types.ObjectId(dto.course_id) : undefined,
    };

    const updatedClass = await this.classModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        teacher_id: new Types.ObjectId(teacherId),
      },
      { $set: updatePayload },
      { returnDocument: 'after', runValidators: true },
    );

    if (!updatedClass) {
      throw new NotFoundException(
        'Không tìm thấy lớp học hoặc bạn không có quyền sửa',
      );
    }

    return {
      message: 'Cập nhật lớp học thành công',
      data: updatedClass,
    };
  }

  async deleteClass(id: string, teacherId: string) {
    this.validateObjectId(id);
    this.validateObjectId(teacherId);

    const deletedClass = await this.classModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      teacher_id: new Types.ObjectId(teacherId),
    });

    if (!deletedClass) {
      throw new NotFoundException(
        'Không tìm thấy lớp học hoặc bạn không có quyền xóa',
      );
    }

    await this.classEnrollmentModel.deleteMany({
      class_id: new Types.ObjectId(id),
    });

    return {
      message: 'Xóa lớp học thành công',
    };
  }

  async addStudentToClass(
    classId: string,
    dto: AddStudentToClassDto,
    teacherId: string,
  ) {
    const classDoc = await this.findOwnedClass(classId, teacherId);
    const student = await this.findStudent(dto.student_id);

    try {
      const enrollment = await this.classEnrollmentModel.create({
        class_id: classDoc._id,
        student_id: student._id,
      });

      return {
        message: 'Thêm học sinh vào lớp thành công',
        data: enrollment,
      };
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('Học sinh đã có trong lớp');
      }
      throw error;
    }
  }

  async removeStudentFromClass(
    classId: string,
    studentId: string,
    teacherId: string,
  ) {
    await this.findOwnedClass(classId, teacherId);
    const student = await this.findStudent(studentId);

    const result = await this.classEnrollmentModel.deleteOne({
      class_id: new Types.ObjectId(classId),
      student_id: student._id,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Không tìm thấy enrollment của học sinh');
    }

    return {
      message: 'Xóa học sinh khỏi lớp thành công',
    };
  }

  async getClassEnrollments(classId: string, teacherId: string) {
    await this.findOwnedClass(classId, teacherId);

    return (await this.classEnrollmentModel
      .find({ class_id: new Types.ObjectId(classId) })
      .populate('student_id', 'fullname username email phone avatar_url status')
      .sort({ joined_date: -1 })) as unknown as EnrollmentWithStudent[];
  }

  async getClassesByStudent(studentId: string) {
    this.validateObjectId(studentId);

    const enrollments = (await this.classEnrollmentModel
      .find({ student_id: new Types.ObjectId(studentId) })
      .populate({
        path: 'class_id',
        populate: { path: 'course_id', select: 'title category status' },
      })
      .sort({ joined_date: -1 })) as unknown as EnrollmentWithClass[];

    return enrollments.map((enrollment) => enrollment.class_id);
  }

  private async findOwnedClass(
    classId: string,
    teacherId: string,
  ): Promise<ClassDocument> {
    this.validateObjectId(classId);
    this.validateObjectId(teacherId);

    const classDoc = await this.classModel.findOne({
      _id: new Types.ObjectId(classId),
      teacher_id: new Types.ObjectId(teacherId),
    });

    if (!classDoc) {
      throw new NotFoundException(
        'Không tìm thấy lớp học hoặc bạn không có quyền thao tác',
      );
    }

    return classDoc;
  }

  async findOne(classId: string): Promise<ClassDocument> {
    return this.findClassDocument(classId);
  }

  private async findClassDocument(classId: string): Promise<ClassDocument> {
    this.validateObjectId(classId);

    const classDoc = await this.classModel.findById(classId);
    if (!classDoc) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }

    return classDoc;
  }

  private async assertCanViewClass(
    classDoc: ClassDocument,
    currentUser: CurrentUser,
  ) {
    if (
      currentUser.role === UserRole.ADMIN ||
      currentUser.role === UserRole.MANAGER ||
      classDoc.teacher_id.toString() === currentUser.id
    ) {
      return;
    }

    if (currentUser.role === UserRole.STUDENT) {
      const enrollment = await this.classEnrollmentModel.exists({
        class_id: classDoc._id,
        student_id: new Types.ObjectId(currentUser.id),
      });

      if (enrollment) {
        return;
      }
    }

    throw new ForbiddenException('Bạn không có quyền xem lớp học này');
  }

  private async findStudent(studentId: string): Promise<UsersDocument> {
    this.validateObjectId(studentId);

    const student = await this.userModel.findOne({
      _id: new Types.ObjectId(studentId),
      role: UserRole.STUDENT,
    });

    if (!student) {
      throw new NotFoundException(
        `Không tìm thấy học sinh với ID #${studentId}`,
      );
    }

    return student;
  }

  async checkStudentInTeacherClass(
    studentId: string,
    teacherId: string,
  ): Promise<boolean> {
    this.validateObjectId(studentId);
    this.validateObjectId(teacherId);

    const enrollments = (await this.classEnrollmentModel
      .find({ student_id: new Types.ObjectId(studentId) })
      .populate('class_id')
      .exec()) as unknown as EnrollmentWithClass[];

    for (const enrollment of enrollments) {
      if (
        enrollment.class_id &&
        enrollment.class_id.teacher_id.toString() === teacherId
      ) {
        return true;
      }
    }
    return false;
  }

  private async validateCourseOwnership(
    courseId: string | undefined,
    teacherId: string,
  ): Promise<void> {
    if (!courseId) {
      return;
    }

    this.validateObjectId(courseId);

    const course = await this.courseModel.findOne({
      _id: new Types.ObjectId(courseId),
      author_id: new Types.ObjectId(teacherId),
      is_deleted: false,
    });

    if (!course) {
      throw new NotFoundException(
        'Không tìm thấy khóa học hoặc bạn không có quyền gắn khóa học này',
      );
    }
  }

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID không hợp lệ: ${id}`);
    }
  }
}

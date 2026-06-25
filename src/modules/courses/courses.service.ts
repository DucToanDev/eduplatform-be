import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course, CourseDocument, CourseStatus } from './schemas/course.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  async create(
    authorId: string,
    createCourseDto: CreateCourseDto,
  ): Promise<Course> {
    const newCourse = new this.courseModel({
      ...createCourseDto,
      author_id: authorId,
      status: CourseStatus.DRAFT,
      is_marketplace: false,
      is_deleted: false,
    });
    return newCourse.save();
  }

  async findAllPublished(): Promise<Course[]> {
    return this.courseModel
      .find({
        status: CourseStatus.PUBLISHED,
        is_marketplace: true,
        is_deleted: false,
      })
      .exec();
  }

  async findCategories(): Promise<string[]> {
    const categories = await this.courseModel.distinct('category', {
      category: { $nin: [null, ''] },
      status: CourseStatus.PUBLISHED,
      is_marketplace: true,
      is_deleted: false,
    });

    return categories.sort((a, b) => a.localeCompare(b));
  }

  async findTeacherCourses(authorId: string): Promise<Course[]> {
    return this.courseModel
      .find({ author_id: authorId, is_deleted: false })
      .exec();
  }

  async findOne(id: string): Promise<CourseDocument> {
    const course = await this.courseModel
      .findOne({ _id: id, is_deleted: false })
      .exec();
    if (!course) {
      throw new NotFoundException('Không tìm thấy khóa học');
    }
    return course;
  }

  async update(
    id: string,
    authorId: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<CourseDocument> {
    const course = await this.findOne(id);

    if (course.author_id.toString() !== authorId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa khóa học này');
    }

    Object.assign(course, updateCourseDto);
    return course.save();
  }

  async remove(id: string, authorId: string): Promise<CourseDocument> {
    const course = await this.findOne(id);

    if (course.author_id.toString() !== authorId) {
      throw new ForbiddenException('Bạn không có quyền xóa khóa học này');
    }

    course.is_deleted = true;
    course.is_marketplace = false;
    return course.save();
  }

  async requestPublish(id: string, authorId: string): Promise<CourseDocument> {
    const course = await this.findOne(id);

    if (course.author_id.toString() !== authorId) {
      throw new ForbiddenException('Bạn không có quyền thao tác khóa học này');
    }

    if (
      course.status !== CourseStatus.DRAFT &&
      course.status !== CourseStatus.REJECTED
    ) {
      throw new ForbiddenException(
        'Khóa học đang ở trạng thái không thể yêu cầu duyệt',
      );
    }

    course.status = CourseStatus.PENDING_APPROVAL;
    return course.save();
  }

  async findAllPending(): Promise<Course[]> {
    return this.courseModel
      .find({
        status: CourseStatus.PENDING_APPROVAL,
        is_deleted: false,
      })
      .exec();
  }

  async approveCourse(id: string): Promise<CourseDocument> {
    const course = await this.findOne(id);
    if (course.status !== CourseStatus.PENDING_APPROVAL) {
      throw new ForbiddenException(
        'Chỉ có thể duyệt khóa học đang ở trạng thái chờ duyệt',
      );
    }
    course.status = CourseStatus.PUBLISHED;
    course.is_marketplace = true;
    return course.save();
  }

  async rejectCourse(id: string): Promise<CourseDocument> {
    const course = await this.findOne(id);
    if (course.status !== CourseStatus.PENDING_APPROVAL) {
      throw new ForbiddenException(
        'Chỉ có thể từ chối khóa học đang ở trạng thái chờ duyệt',
      );
    }
    course.status = CourseStatus.REJECTED;
    course.is_marketplace = false;
    return course.save();
  }

  async hideCourse(id: string): Promise<CourseDocument> {
    const course = await this.findOne(id);
    course.status = CourseStatus.HIDDEN;
    course.is_marketplace = false;
    return course.save();
  }
}

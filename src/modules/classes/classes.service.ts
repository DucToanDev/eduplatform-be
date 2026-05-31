import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Class, ClassDocument } from './schemas/class.schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,
  ) {}

  private validateObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID không hợp lệ: ${id}`);
    }
  }

  async createClass(dto: CreateClassDto, teacherId: string) {
    const newClass = await this.classModel.create({
      class_name: dto.class_name,
      teacher_id: new Types.ObjectId(teacherId),
    });

    return {
      message: 'Tạo lớp học thành công',
      data: newClass,
    };
  }

  async getClassesByTeacher(teacherId: string) {
    this.validateObjectId(teacherId);
    return this.classModel.find({ teacher_id: new Types.ObjectId(teacherId) });
  }

  async updateClass(id: string, dto: UpdateClassDto, teacherId: string) {
    this.validateObjectId(id);
    const updatedClass = await this.classModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), teacher_id: new Types.ObjectId(teacherId) },
      { $set: dto },
      { new: true },
    );

    if (!updatedClass) {
      throw new NotFoundException('Không tìm thấy lớp học hoặc bạn không có quyền sửa');
    }

    return {
      message: 'Cập nhật lớp học thành công',
      data: updatedClass,
    };
  }

  async deleteClass(id: string, teacherId: string) {
    this.validateObjectId(id);
    const deletedClass = await this.classModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      teacher_id: new Types.ObjectId(teacherId),
    });

    if (!deletedClass) {
      throw new NotFoundException('Không tìm thấy lớp học hoặc bạn không có quyền xóa');
    }

    // TODO: Ideally we should also delete or update related class_enrollments

    return {
      message: 'Xóa lớp học thành công',
    };
  }
}

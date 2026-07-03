import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { ClassesService } from '../classes/classes.service';
import { StudentProfile, StudentProfileDocument } from '../users/schemas/student-profile.schema';

@Injectable()
export class PointsService {
  constructor(
    @InjectModel(StudentProfile.name)
    private studentProfileModel: Model<StudentProfileDocument>,
    private readonly classesService: ClassesService,
  ) {}

  async adjustPoints(
    studentId: string,
    amount: number,
    session?: ClientSession,
  ) {
    return this.studentProfileModel.findOneAndUpdate(
      { user_id: new Types.ObjectId(studentId) },
      { $inc: { points: amount } },
      { returnDocument: 'after', upsert: false, session },
    );
  }

  async getBalance(studentId: string, session?: ClientSession) {
    const record = await this.studentProfileModel
      .findOne({ user_id: new Types.ObjectId(studentId) })
      .session(session || null)
      .exec();
    return { balance: record?.points || 0 };
  }
}

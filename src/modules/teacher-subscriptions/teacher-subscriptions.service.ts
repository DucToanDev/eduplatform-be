import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TeacherSubscription, TeacherSubscriptionDocument, TeacherSubscriptionStatus } from './schemas/teacher-subscription.schema';

@Injectable()
export class TeacherSubscriptionsService {
  constructor(
    @InjectModel(TeacherSubscription.name)
    private teacherSubscriptionModel: Model<TeacherSubscriptionDocument>,
  ) {}

  async activateSubscription(teacherId: string, packageId: string, featuresSnapshot: any): Promise<TeacherSubscriptionDocument> {
    const activeSub = await this.teacherSubscriptionModel.findOne({
      teacher_id: new Types.ObjectId(teacherId),
      status: TeacherSubscriptionStatus.ACTIVE,
    }).exec();

    // 1. Nếu là Gia hạn (Cùng packageId)
    if (activeSub && activeSub.package_id.toString() === packageId) {
      // Cộng thêm 30 ngày vào end_date hiện tại
      const newEndDate = new Date(activeSub.end_date);
      newEndDate.setDate(newEndDate.getDate() + 30);
      activeSub.end_date = newEndDate;
      return activeSub.save();
    }

    // 2. Nếu là Nâng cấp (Khác packageId) hoặc Đăng ký mới
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    if (activeSub) {
      activeSub.status = TeacherSubscriptionStatus.UPGRADED;
      await activeSub.save();
    }

    const newSub = new this.teacherSubscriptionModel({
      teacher_id: new Types.ObjectId(teacherId),
      package_id: new Types.ObjectId(packageId),
      features_snapshot: featuresSnapshot,
      start_date: startDate,
      end_date: endDate,
      status: TeacherSubscriptionStatus.ACTIVE,
    });

    return newSub.save();
  }

  async getCurrentSubscription(teacherId: string): Promise<TeacherSubscriptionDocument | null> {
    return this.teacherSubscriptionModel
      .findOne({ teacher_id: new Types.ObjectId(teacherId), status: TeacherSubscriptionStatus.ACTIVE })
      .populate('package_id')
      .exec();
  }

  async cancelSubscription(teacherId: string): Promise<TeacherSubscriptionDocument> {
    const activeSub = await this.teacherSubscriptionModel.findOne({
      teacher_id: new Types.ObjectId(teacherId),
      status: TeacherSubscriptionStatus.ACTIVE,
    }).exec();

    if (!activeSub) {
      throw new NotFoundException('Không tìm thấy gói thuê bao nào đang hoạt động');
    }

    activeSub.status = TeacherSubscriptionStatus.CANCELED;
    return activeSub.save();
  }

  async getSubscriptionHistory(teacherId: string): Promise<TeacherSubscriptionDocument[]> {
    return this.teacherSubscriptionModel
      .find({ teacher_id: new Types.ObjectId(teacherId) })
      .sort({ created_at: -1 })
      .populate('package_id')
      .exec();
  }
}

import {
  BadRequestException,
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
import { Users, UsersDocument } from '../users/schemas/users.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(Users.name)
    private readonly userModel: Model<UsersDocument>,
  ) {}

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID không hợp lệ: ${id}`);
    }
  }

  async findForUser(
    userId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Notification>> {
    const filter = { user_id: new Types.ObjectId(userId) };
    const skip = getPaginationSkip(paginationQuery);

    const [data, total] = await Promise.all([
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(paginationQuery.limit)
        .exec(),
      this.notificationModel.countDocuments(filter),
    ]);

    return buildPaginatedResponse(data, total, paginationQuery);
  }

  async markAsRead(id: string, userId: string) {
    this.validateObjectId(id);

    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), user_id: new Types.ObjectId(userId) },
      { $set: { is_read: true } },
      { new: true },
    );

    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }

    return {
      message: 'Đã đánh dấu thông báo là đã đọc',
      data: notification,
    };
  }

  async markAllAsRead(userId: string) {
    const result = await this.notificationModel.updateMany(
      { user_id: new Types.ObjectId(userId), is_read: false },
      { $set: { is_read: true } },
    );

    return {
      message: 'Đã đánh dấu tất cả thông báo là đã đọc',
      modified: result.modifiedCount,
    };
  }

  async remove(id: string, userId: string) {
    this.validateObjectId(id);

    const deleted = await this.notificationModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      user_id: new Types.ObjectId(userId),
    });

    if (!deleted) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }

    return {
      message: 'Xóa thông báo thành công',
    };
  }

  // Admin/hệ thống tạo thông báo cho một người dùng.
  async create(dto: CreateNotificationDto) {
    this.validateObjectId(dto.user_id);

    const userExists = await this.userModel.exists({ _id: dto.user_id });
    if (!userExists) {
      throw new NotFoundException('Không tìm thấy người dùng nhận thông báo');
    }

    const notification = await this.notificationModel.create({
      user_id: new Types.ObjectId(dto.user_id),
      message: dto.message,
    });

    return {
      message: 'Tạo thông báo thành công',
      data: notification,
    };
  }
}

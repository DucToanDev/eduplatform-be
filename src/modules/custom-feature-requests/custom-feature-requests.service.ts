import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import {
  buildPaginatedResponse,
  getPaginationSkip,
} from '../../common/utils/pagination.util';
import { UserRole } from '../users/schemas/users.schema';
import { CreateCustomFeatureRequestDto } from './dto/create-custom-feature-request.dto';
import { CustomFeatureRequestQueryDto } from './dto/custom-feature-request-query.dto';
import { UpdateCustomFeatureRequestStatusDto } from './dto/update-custom-feature-request-status.dto';
import {
  CustomFeatureRequest,
  CustomFeatureRequestDocument,
} from './schemas/custom-feature-request.schema';

@Injectable()
export class CustomFeatureRequestsService {
  constructor(
    @InjectModel(CustomFeatureRequest.name)
    private readonly requestModel: Model<CustomFeatureRequestDocument>,
  ) {}

  async create(teacherId: string, dto: CreateCustomFeatureRequestDto) {
    if (!Types.ObjectId.isValid(teacherId)) {
      throw new BadRequestException('Teacher id không hợp lệ');
    }

    return this.requestModel.create({
      ...dto,
      teacher_id: new Types.ObjectId(teacherId),
    });
  }

  async findAll(query: CustomFeatureRequestQueryDto) {
    const filter = this.buildFilter(query);
    const [data, total] = await Promise.all([
      this.requestModel
        .find(filter)
        .populate('teacher_id', 'fullname email phone avatar_url role')
        .sort({ createdAt: -1, _id: -1 })
        .skip(getPaginationSkip(query))
        .limit(query.limit)
        .exec(),
      this.requestModel.countDocuments(filter),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  async findOne(id: string, currentUser: { id: string; role: UserRole }) {
    const request = await this.findDocument(id);
    const canView =
      currentUser.role === UserRole.ADMIN ||
      currentUser.role === UserRole.MANAGER ||
      request.teacher_id.toString() === currentUser.id;

    if (!canView) {
      throw new ForbiddenException('Bạn không có quyền xem yêu cầu này');
    }

    return request.populate(
      'teacher_id',
      'fullname email phone avatar_url role',
    );
  }

  async updateStatus(id: string, dto: UpdateCustomFeatureRequestStatusDto) {
    const request = await this.requestModel
      .findByIdAndUpdate(
        id,
        { status: dto.status },
        { returnDocument: 'after', runValidators: true },
      )
      .populate('teacher_id', 'fullname email phone avatar_url role');

    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu custom feature');
    }

    return request;
  }

  private async findDocument(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }

    const request = await this.requestModel.findById(id);
    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu custom feature');
    }

    return request;
  }

  private buildFilter(
    query: CustomFeatureRequestQueryDto,
  ): QueryFilter<CustomFeatureRequestDocument> {
    const filter: QueryFilter<CustomFeatureRequestDocument> = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.teacher_id) {
      if (!Types.ObjectId.isValid(query.teacher_id)) {
        throw new BadRequestException('Teacher id không hợp lệ');
      }
      filter.teacher_id = new Types.ObjectId(query.teacher_id);
    }

    return filter;
  }
}

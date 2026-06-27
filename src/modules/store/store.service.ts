import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  StoreItem,
  StoreItemDocument,
  StoreItemStatus,
} from './schemas/store-item.schema';
import {
  StudentInventory,
  StudentInventoryDocument,
} from './schemas/student-inventory.schema';
import { PointsService } from '../points/points.service';

@Injectable()
export class StoreService {
  constructor(
    @InjectModel(StoreItem.name)
    private storeItemModel: Model<StoreItemDocument>,
    @InjectModel(StudentInventory.name)
    private studentInventoryModel: Model<StudentInventoryDocument>,
    private pointsService: PointsService,
  ) {}

  async createStoreItem(teacherId: string, createDto: any) {
    return this.storeItemModel.create({
      ...createDto,
      teacher_id: new Types.ObjectId(teacherId),
    });
  }

  async updateStoreItem(teacherId: string, itemId: string, updateDto: any) {
    const item = await this.storeItemModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(itemId),
        teacher_id: new Types.ObjectId(teacherId),
      },
      updateDto,
      { new: true },
    );
    if (!item)
      throw new NotFoundException(
        'Store item not found or you do not have permission',
      );
    return item;
  }

  async deleteStoreItem(teacherId: string, itemId: string) {
    const item = await this.storeItemModel.findOneAndDelete({
      _id: new Types.ObjectId(itemId),
      teacher_id: new Types.ObjectId(teacherId),
    });
    if (!item)
      throw new NotFoundException(
        'Store item not found or you do not have permission',
      );
    return { success: true };
  }

  async getActiveStoreItems() {
    return this.storeItemModel
      .find({ status: StoreItemStatus.ACTIVE, stock: { $gt: 0 } })
      .exec();
  }

  async getStoreItemById(itemId: string) {
    const item = await this.storeItemModel.findById(itemId).exec();
    if (!item) throw new NotFoundException('Store item not found');
    return item;
  }

  async redeemItem(studentId: string, itemId: string) {
    const studentObjId = new Types.ObjectId(studentId);
    const itemObjId = new Types.ObjectId(itemId);

    const session = await this.storeItemModel.db.startSession();
    session.startTransaction();
    try {
      const item = await this.storeItemModel
        .findById(itemObjId)
        .session(session);
      if (
        !item ||
        (item.status as unknown as StoreItemStatus) !==
          StoreItemStatus.ACTIVE ||
        item.stock <= 0
      ) {
        throw new BadRequestException('Item is not available');
      }

      const balanceRecord = await this.pointsService.getBalance(
        studentId,
        session,
      );
      const currentBalance = balanceRecord?.balance || 0;

      if (currentBalance < item.points) {
        throw new BadRequestException('Not enough points');
      }

      // Deduct points
      await this.pointsService.adjustPoints(studentId, -item.points, session);

      // Decrease stock, increase sold_count
      await this.storeItemModel.updateOne(
        { _id: itemObjId },
        { $inc: { stock: -1, sold_count: 1 } },
        { session },
      );

      // Add to inventory
      const inventoryItem = await this.studentInventoryModel.create(
        [
          {
            student_id: studentObjId,
            item_id: itemObjId,
            type: item.type,
            points: item.points,
            active: false,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return inventoryItem[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async getStudentInventory(studentId: string) {
    return this.studentInventoryModel
      .find({ student_id: new Types.ObjectId(studentId) })
      .populate('item_id')
      .exec();
  }

  async toggleInventoryItem(studentId: string, inventoryId: string) {
    const inventoryItem = await this.studentInventoryModel.findOne({
      _id: new Types.ObjectId(inventoryId),
      student_id: new Types.ObjectId(studentId),
    });
    if (!inventoryItem) throw new NotFoundException('Inventory item not found');

    inventoryItem.active = !inventoryItem.active;
    await inventoryItem.save();
    return inventoryItem;
  }
}

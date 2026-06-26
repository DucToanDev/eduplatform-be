import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SubscriptionPackage,
  SubscriptionPackageDocument,
} from './schemas/subscription-package.schema';
import { CreateSubscriptionPackageDto } from './dto/create-subscription-package.dto';
import { UpdateSubscriptionPackageDto } from './dto/update-subscription-package.dto';

@Injectable()
export class SubscriptionPackagesService {
  constructor(
    @InjectModel(SubscriptionPackage.name)
    private subscriptionPackageModel: Model<SubscriptionPackageDocument>,
  ) {}

  async findActivePackages(): Promise<SubscriptionPackage[]> {
    return this.subscriptionPackageModel
      .find({ is_active: true })
      .sort({ order_index: 1, price: 1 })
      .exec();
  }

  async createPackage(
    createDto: CreateSubscriptionPackageDto,
  ): Promise<SubscriptionPackage> {
    const createdPackage = new this.subscriptionPackageModel(createDto);
    return createdPackage.save();
  }

  async updatePackage(
    id: string,
    updateDto: UpdateSubscriptionPackageDto,
  ): Promise<SubscriptionPackage> {
    const updatedPackage = await this.subscriptionPackageModel
      .findByIdAndUpdate(id, updateDto, { returnDocument: 'after' })
      .exec();
    if (!updatedPackage) {
      throw new NotFoundException(`Subscription package #${id} not found`);
    }
    return updatedPackage;
  }

  async disablePackage(id: string): Promise<SubscriptionPackage> {
    const updatedPackage = await this.subscriptionPackageModel
      .findByIdAndUpdate(id, { is_active: false }, { returnDocument: 'after' })
      .exec();
    if (!updatedPackage) {
      throw new NotFoundException(`Subscription package #${id} not found`);
    }
    return updatedPackage;
  }
}

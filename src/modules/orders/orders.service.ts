import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderReferenceType, OrderStatus } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { SubscriptionPackagesService } from '../subscription-packages/subscription-packages.service';
import { TeacherSubscriptionsService } from '../teacher-subscriptions/teacher-subscriptions.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly subscriptionPackagesService: SubscriptionPackagesService,
    private readonly teacherSubsService: TeacherSubscriptionsService,
  ) {}

  async createOrder(userId: string, createDto: CreateOrderDto) {
    if (createDto.reference_type !== OrderReferenceType.SUBSCRIPTION) {
      throw new BadRequestException('Hiện tại chỉ hỗ trợ mua Gói thuê bao (SUBSCRIPTION)');
    }

    // Lấy thông tin package để snapshot giá
    let packageInfo;
    try {
      packageInfo = await this.subscriptionPackagesService['subscriptionPackageModel'].findById(createDto.reference_id).exec();
    } catch (e) {
      throw new NotFoundException('Gói thuê bao không tồn tại');
    }

    if (!packageInfo || !packageInfo.is_active) {
      throw new NotFoundException('Gói thuê bao không tồn tại hoặc đã bị ẩn');
    }

    let finalPrice = packageInfo.price;

    const activeSub = await this.teacherSubsService.getCurrentSubscription(userId);
    if (activeSub && activeSub.package_id) {
      const oldPackageId = activeSub.package_id._id.toString();
      const oldPackagePrice = (activeSub.package_id as any).price;

      // 1. Nếu đang sở hữu gói này (Truyền vào trùng ID gói hiện tại)
      if (oldPackageId === createDto.reference_id) {
        // Gói cơ bản (price = 0) không cho phép gia hạn
        if (oldPackagePrice === 0) {
          throw new BadRequestException('Bạn đang sử dụng Gói Cơ Bản, không thể gia hạn gói này!');
        }
        // Các gói khác -> Gia hạn (không trừ phí)
        finalPrice = packageInfo.price;
      } 
      // 2. Nếu truyền vào gói khác gói hiện tại
      else {
        // Nâng cấp gói (Giá mới > Giá cũ)
        if (packageInfo.price > oldPackagePrice) {
          const now = new Date().getTime();
          const start = activeSub.start_date.getTime();
          const end = activeSub.end_date.getTime();
          
          const usedDays = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
          const totalDays = Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
          
          const usedPercentage = (usedDays / totalDays) * 100;
          const deductionPercentage = Math.floor(usedPercentage / 10) * 10;
          
          const refundAmount = oldPackagePrice - (oldPackagePrice * deductionPercentage / 100);
          finalPrice = Math.max(0, packageInfo.price - refundAmount);
        } 
        // Hạ cấp gói (Giá mới <= Giá cũ)
        else {
          throw new BadRequestException('Không thể đăng ký gói thấp hơn hoặc bằng gói hiện tại khi gói hiện tại đang hoạt động!');
        }
      }
    } else {
      // Không có gói nào đang active -> Nếu mua gói cơ bản thì giá 0, mua gói khác giá bt
      finalPrice = packageInfo.price;
    }

    // Sinh mã đơn hàng ngẫu nhiên 6 chữ số
    const shortCode = Math.floor(100000 + Math.random() * 900000).toString();

    const order = new this.orderModel({
      user_id: new Types.ObjectId(userId),
      code: shortCode,
      reference_type: createDto.reference_type,
      reference_id: new Types.ObjectId(createDto.reference_id),
      item_name_snapshot: packageInfo.name,
      item_price_snapshot: finalPrice,
      payment_method: createDto.payment_method,
      status: finalPrice <= 0 ? OrderStatus.PAID : OrderStatus.PENDING,
    });

    const savedOrder = await order.save();

    // Nếu giá = 0 thì kích hoạt luôn
    if (savedOrder.status === OrderStatus.PAID) {
      await this.teacherSubsService.activateSubscription(userId, createDto.reference_id, packageInfo.features);
    }

    // Sinh thông tin VietQR nếu đơn đang chờ thanh toán
    let qrUrl: string | null = null;
    let transferContent: string | null = null;
    if (savedOrder.status === OrderStatus.PENDING) {
      const bankId = process.env.VIETQR_BANK_ID || '';
      const accountNo = process.env.VIETQR_ACCOUNT_NO || '';
      const accountName = process.env.VIETQR_ACCOUNT_NAME || '';
      const amount = finalPrice;
      transferContent = `EDU${savedOrder.code}`;
      
      if (bankId && accountNo) {
        qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;
      }
    }

    return {
      order: savedOrder,
      payment_info: {
        qr_url: qrUrl,
        transfer_content: transferContent,
        amount: finalPrice,
      }
    };
  }

  async getUserOrders(userId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({ user_id: new Types.ObjectId(userId) }).sort({ created_at: -1 }).exec();
  }

  async getOrderById(id: string, userId: string): Promise<OrderDocument> {
    const order = await this.orderModel.findOne({ _id: new Types.ObjectId(id), user_id: new Types.ObjectId(userId) }).exec();
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  async cancelOrder(id: string, userId: string): Promise<OrderDocument> {
    const order = await this.orderModel.findOne({ _id: new Types.ObjectId(id), user_id: new Types.ObjectId(userId) }).exec();
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng của bạn');
    if (order.status !== OrderStatus.PENDING) throw new BadRequestException('Chỉ có thể hủy đơn hàng đang chờ thanh toán');
    
    order.status = OrderStatus.CANCELLED;
    return order.save();
  }

  async processSepayWebhook(data: any): Promise<void> {
    // 1. Trích xuất thông tin
    const { transferType, transferAmount, content } = data;

    // Chỉ xử lý tiền vào
    if (transferType !== 'in') return;

    // 2. Tìm mã Order trong content (ví dụ: EDU123456)
    const match = content.match(/EDU\s*([0-9]{6})/i);
    if (!match) return;

    const orderCode = match[1];

    // 3. Tìm order
    const order = await this.orderModel.findOne({ code: orderCode }).exec();
    if (!order) return;
    if (order.status !== OrderStatus.PENDING) return;

    // 4. Kiểm tra số tiền
    if (transferAmount < order.item_price_snapshot) return;

    // 5. Đánh dấu thanh toán và kích hoạt gói
    order.status = OrderStatus.PAID;
    const savedOrder = await order.save();

    if (savedOrder.reference_type === OrderReferenceType.SUBSCRIPTION) {
      const packageInfo = await this.subscriptionPackagesService['subscriptionPackageModel'].findById(savedOrder.reference_id).exec();
      const features = packageInfo ? packageInfo.features : null;
      await this.teacherSubsService.activateSubscription(
        savedOrder.user_id.toString(),
        savedOrder.reference_id.toString(),
        features
      );
    }
  }
}

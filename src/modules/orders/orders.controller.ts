import { Body, Controller, Get, Param, Patch, Post, Req, Res, UseGuards, Headers, UnauthorizedException, HttpCode } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/users.schema';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Tạo đơn hàng mua Gói thuê bao (Dành cho Giáo viên)' })
  async createOrder(@Req() req: any, @Body() createDto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.userId, createDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng của tôi' })
  async getMyOrders(@Req() req: any) {
    return this.ordersService.getUserOrders(req.user.userId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Xem chi tiết 1 đơn hàng' })
  async getOrderById(@Req() req: any, @Param('id', ParseObjectIdPipe) id: string) {
    return this.ordersService.getOrderById(id, req.user.userId);
  }

  @Patch(':id/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Hủy đơn hàng đang chờ thanh toán' })
  async cancelOrder(@Req() req: any, @Param('id', ParseObjectIdPipe) id: string) {
    return this.ordersService.cancelOrder(id, req.user.userId);
  }

  @Post('webhook/sepay')
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook nhận dữ liệu từ SePay' })
  @ApiHeader({ name: 'authorization', description: 'SePay API Key (VD: Apikey ICCRZ...)', required: false })
  async sepayWebhook(@Headers('authorization') authHeader: string, @Body() body: any, @Res() res: Response) {
    const apiToken = process.env.SEPAY_WEBHOOK_TOKEN;
    
    // Nếu có cấu hình token thì kiểm tra, nếu không có thì bỏ qua (dùng cho test)
    if (apiToken) {
      if (!authHeader || authHeader !== `Apikey ${apiToken}`) {
        throw new UnauthorizedException('Invalid API Key');
      }
    }

    try {
      await this.ordersService.processSepayWebhook(body);
      return res.status(200).json({ success: true });
    } catch (error) {
      // Sepay yêu cầu trả về success: true (hoặc 200) để không gửi lại webhook liên tục, 
      // kể cả khi có lỗi logic bên trong xử lý. Bạn có thể ghi log lỗi ở đây.
      console.error('Sepay Webhook Processing Error:', error);
      return res.status(200).json({ success: true });
    }
  }
}

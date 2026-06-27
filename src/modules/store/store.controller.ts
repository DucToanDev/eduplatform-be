import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreItemDto, UpdateStoreItemDto } from './dto/store-item.dto';
import { RedeemItemDto } from './dto/redeem.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/users.schema';

@ApiTags('Store')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @ApiOperation({ summary: 'Tạo vật phẩm mới trong cửa hàng' })
  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.MANAGER)
  @Post()
  async createStoreItem(@Req() req: any, @Body() dto: CreateStoreItemDto) {
    const teacherId = req.user.id;
    return this.storeService.createStoreItem(teacherId, dto);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin vật phẩm' })
  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.MANAGER)
  @Patch(':id')
  async updateStoreItem(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateStoreItemDto,
  ) {
    const teacherId = req.user.id;
    return this.storeService.updateStoreItem(teacherId, id, dto);
  }

  @ApiOperation({ summary: 'Xóa vật phẩm khỏi cửa hàng' })
  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.MANAGER)
  @Delete(':id')
  async deleteStoreItem(@Req() req: any, @Param('id') id: string) {
    const teacherId = req.user.id;
    return this.storeService.deleteStoreItem(teacherId, id);
  }

  @ApiOperation({ summary: 'Lấy danh sách vật phẩm đang bán' })
  @Get()
  async getActiveStoreItems() {
    return this.storeService.getActiveStoreItems();
  }

  @ApiOperation({ summary: 'Xem chi tiết một vật phẩm' })
  @Get(':id')
  async getStoreItemById(@Param('id') id: string) {
    return this.storeService.getStoreItemById(id);
  }

  @ApiOperation({ summary: 'Đổi điểm lấy vật phẩm' })
  @Post('redeem')
  async redeemItem(@Req() req: any, @Body() dto: RedeemItemDto) {
    const studentId = req.user.id;
    return this.storeService.redeemItem(studentId, dto.item_id);
  }

  @ApiOperation({ summary: 'Xem kho đồ của học sinh' })
  @Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.MANAGER)
  @Get('inventory/my')
  async getInventory(@Req() req: any) {
    const studentId = req.user.id;
    return this.storeService.getStudentInventory(studentId);
  }

  @ApiOperation({ summary: 'Bật/Tắt sử dụng vật phẩm trong kho' })
  @Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.MANAGER)
  @Patch('inventory/:id/toggle')
  async toggleInventoryItem(@Req() req: any, @Param('id') id: string) {
    const studentId = req.user.id;
    return this.storeService.toggleInventoryItem(studentId, id);
  }
}

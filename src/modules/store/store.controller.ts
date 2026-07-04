import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StoreService } from './store.service';
import { CreateStoreItemDto, UpdateStoreItemDto } from './dto/store-item.dto';
import { RedeemItemDto } from './dto/redeem.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
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
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        points: { type: 'number' },
        stock: { type: 'number' },
        status: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
      required: ['type', 'name', 'points', 'stock'],
    },
  })
  async createStoreItem(
    @Req() req: any,
    @Body() dto: CreateStoreItemDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const teacherId = req.user.id;
    return this.storeService.createStoreItem(teacherId, dto, image);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin vật phẩm' })
  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.MANAGER)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        points: { type: 'number' },
        stock: { type: 'number' },
        status: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  async updateStoreItem(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateStoreItemDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const teacherId = req.user.id;
    return this.storeService.updateStoreItem(teacherId, id, dto, image);
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

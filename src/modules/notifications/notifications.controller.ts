import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/users.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy thông báo của user hiện tại (có phân trang)' })
  @ApiOkResponse({ description: 'Thành công' })
  findMine(@Query() paginationQuery: PaginationQueryDto, @Req() req: any) {
    return this.notificationsService.findForUser(
      req.user.userId,
      paginationQuery,
    );
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo đã đọc' })
  @ApiOkResponse({ description: 'Thành công' })
  markAllRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Đánh dấu một thông báo đã đọc' })
  @ApiOkResponse({ description: 'Thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy thông báo' })
  markRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa/ẩn một thông báo' })
  @ApiOkResponse({ description: 'Xóa thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy thông báo' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.remove(id, req.user.userId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin/hệ thống tạo thông báo cho người dùng' })
  @ApiCreatedResponse({ description: 'Tạo thông báo thành công' })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền Admin' })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy người dùng nhận thông báo',
  })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }
}

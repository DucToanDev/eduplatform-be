import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/users.schema';
import { TeacherSubscriptionsService } from './teacher-subscriptions.service';

@ApiTags('Teacher Subscriptions')
@Controller('teacher-subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherSubscriptionsController {
  constructor(
    private readonly teacherSubsService: TeacherSubscriptionsService,
  ) {}

  @Get('current')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Lấy gói thuê bao hiện tại của Giáo viên' })
  async getCurrentSubscription(@Req() req: any) {
    return this.teacherSubsService.getCurrentSubscription(req.user.id);
  }

  @Get('history')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Lấy lịch sử mua gói thuê bao của Giáo viên' })
  async getHistory(@Req() req: any) {
    return this.teacherSubsService.getSubscriptionHistory(req.user.id);
  }
  @Post('cancel')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Hủy gói thuê bao đang hoạt động của Giáo viên' })
  async cancelSubscription(@Req() req: any) {
    return this.teacherSubsService.cancelSubscription(req.user.id);
  }
}

import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthenticatedUser, JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/users.schema';
import { RevenueReportQueryDto } from './dto/revenue-report-query.dto';
import { ReportsService } from './reports.service';

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Báo cáo doanh thu/commission hệ thống' })
  getRevenueReport(@Query() query: RevenueReportQueryDto) {
    return this.reportsService.getRevenueReport(query);
  }

  @Get('teacher/revenue')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Giáo viên xem báo cáo doanh thu của mình' })
  getTeacherRevenueReport(
    @Req() req: AuthenticatedRequest,
    @Query() query: RevenueReportQueryDto,
  ) {
    return this.reportsService.getTeacherRevenueReport(req.user.id, query);
  }
}

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorLogsService } from './error-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/users.schema';

@ApiTags('Error Logs')
@Controller('error-logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ErrorLogsController {
  constructor(private readonly errorLogsService: ErrorLogsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Lấy danh sách Error Logs 7 ngày gần nhất (Chỉ Admin)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    return this.errorLogsService.getRecentLogs(limitNum, pageNum);
  }
}

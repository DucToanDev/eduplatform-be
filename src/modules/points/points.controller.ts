import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PointsService } from './points.service';
import { AdjustPointsDto } from './dto/reward.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/users.schema';

@ApiTags('Points')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @ApiOperation({ summary: 'Xem số dư điểm thưởng của học sinh' })
  @Get('balance')
  async getBalance(@Req() req: any) {
    const studentId = req.user.id;
    return this.pointsService.getBalance(studentId);
  }

  @ApiOperation({
    summary: 'Cộng/Trừ điểm thủ công cho học sinh (Teacher/Admin)',
  })
  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.MANAGER)
  @Patch(':studentId/adjust')
  async adjustPoints(
    @Param('studentId') studentId: string,
    @Body() dto: AdjustPointsDto,
  ) {
    return this.pointsService.adjustPoints(studentId, dto.amount);
  }
}

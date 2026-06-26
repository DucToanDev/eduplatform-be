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
import { ClassesService } from '../classes/classes.service';
import { ForbiddenException } from '@nestjs/common';

@ApiTags('Points')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('points')
export class PointsController {
  constructor(
    private readonly pointsService: PointsService,
    private readonly classesService: ClassesService,
  ) {}

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
    @Req() req: any,
    @Param('studentId') studentId: string,
    @Body() dto: AdjustPointsDto,
  ) {
    if (req.user.role === UserRole.TEACHER) {
      const isOwned = await this.classesService.checkStudentInTeacherClass(
        studentId,
        req.user.id,
      );
      if (!isOwned) {
        throw new ForbiddenException(
          'Học sinh này không thuộc bất kỳ lớp nào do bạn quản lý.',
        );
      }
    }
    return this.pointsService.adjustPoints(studentId, dto.amount);
  }
}

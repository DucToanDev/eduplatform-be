import {
  Body,
  Controller,
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
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/users.schema';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateCompletionDto } from './dto/update-completion.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { ProgressService } from './progress.service';

@ApiTags('Student Progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Tạo/cập nhật tiến độ học của học sinh hiện tại (Học sinh)',
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bài học' })
  upsert(@Body() createProgressDto: CreateProgressDto, @Req() req: any) {
    return this.progressService.upsertOwnProgress(
      req.user.id,
      createProgressDto,
    );
  }

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Lấy toàn bộ tiến độ của học sinh hiện tại' })
  @ApiOkResponse({ description: 'Thành công' })
  getOwnProgress(@Req() req: any) {
    return this.progressService.getOwnProgress(req.user.id);
  }

  @Get('me/course/:courseId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Lấy tiến độ của học sinh hiện tại trong một khóa học',
  })
  @ApiOkResponse({ description: 'Thành công' })
  getOwnProgressByCourse(@Param('courseId') courseId: string, @Req() req: any) {
    return this.progressService.getOwnProgressByCourse(req.user.id, courseId);
  }

  @Get('teacher/class/:classId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({
    summary: 'Giáo viên xem tiến độ học sinh theo lớp (lọc thêm theo khóa học)',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    description: 'Lọc tiến độ theo khóa học',
  })
  @ApiOkResponse({ description: 'Thành công' })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy lớp học hoặc không có quyền xem',
  })
  getClassProgressForTeacher(
    @Param('classId') classId: string,
    @Req() req: any,
    @Query('courseId') courseId?: string,
  ) {
    return this.progressService.getClassProgressForTeacher(
      classId,
      req.user.id,
      courseId,
    );
  }

  @Patch(':id/completion')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Cập nhật trạng thái hoàn thành bài học (Học sinh)',
  })
  @ApiOkResponse({ description: 'Cập nhật thành công' })
  @ApiForbiddenResponse({ description: 'Không có quyền cập nhật tiến độ này' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bản ghi tiến độ' })
  updateCompletion(
    @Param('id') id: string,
    @Body() updateCompletionDto: UpdateCompletionDto,
    @Req() req: any,
  ) {
    return this.progressService.updateCompletion(
      id,
      req.user.id,
      updateCompletionDto.is_completed,
    );
  }

  @Patch(':id/score')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({
    summary: 'Cập nhật điểm/score cho một bản ghi tiến độ (Giáo viên)',
  })
  @ApiOkResponse({ description: 'Cập nhật thành công' })
  @ApiForbiddenResponse({
    description: 'Không có quyền chấm điểm cho học sinh này',
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bản ghi tiến độ' })
  updateScore(
    @Param('id') id: string,
    @Body() updateScoreDto: UpdateScoreDto,
    @Req() req: any,
  ) {
    return this.progressService.updateScore(
      id,
      req.user.id,
      updateScoreDto.score,
    );
  }
}

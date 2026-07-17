import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { LearningPathsService } from './learning-paths.service';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { UpdateLearningPathDto } from './dto/update-learning-path.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/users.schema';

@ApiTags('Learning Paths')
@Controller('learning-paths')
export class LearningPathsController {
  constructor(private readonly learningPathsService: LearningPathsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Post()
  @ApiOperation({ summary: 'Admin/Giáo viên tạo lộ trình học cho một lớp' })
  create(@Body() createDto: CreateLearningPathDto) {
    return this.learningPathsService.create(createDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật lộ trình học' })
  update(@Param('id') id: string, @Body() updateDto: UpdateLearningPathDto) {
    return this.learningPathsService.update(id, updateDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('class/:classId')
  @ApiOperation({ summary: 'Lấy lộ trình học của lớp. (Nếu là học sinh, tự map thêm tiến độ)' })
  getPathForClass(@Param('classId') classId: string, @Request() req) {
    const studentId = req.user.role === UserRole.STUDENT ? req.user.id : null;
    return this.learningPathsService.getPathForClass(classId, studentId);
  }
}

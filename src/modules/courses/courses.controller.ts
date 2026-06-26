import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthenticatedUser, JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/users.schema';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách tất cả khóa học đã xuất bản (Public)',
  })
  findAllPublished() {
    return this.coursesService.findAllPublished();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Lấy danh sách danh mục khóa học' })
  findCategories() {
    return this.coursesService.findCategories();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Post()
  @ApiOperation({ summary: 'Tạo khóa học mới (dành cho Giáo viên)' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createCourseDto: CreateCourseDto,
  ) {
    return this.coursesService.create(req.user.id, createCourseDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Get('teacher')
  @ApiOperation({ summary: 'Lấy danh sách khóa học của giáo viên hiện tại' })
  findTeacherCourses(@Req() req: AuthenticatedRequest) {
    return this.coursesService.findTeacherCourses(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một khóa học' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin khóa học (dành cho Giáo viên)' })
  update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, req.user.id, updateCourseDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa/ẩn khóa học (soft delete, dành cho Giáo viên)',
  })
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.coursesService.remove(id, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Post(':id/request-publish')
  @ApiOperation({
    summary: 'Yêu cầu duyệt xuất bản khóa học (dành cho Giáo viên)',
  })
  requestPublish(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.coursesService.requestPublish(id, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/pending')
  @ApiOperation({
    summary: 'Lấy danh sách khóa học đang chờ duyệt (dành cho Admin)',
  })
  findAllPending() {
    return this.coursesService.findAllPending();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/:id/approve')
  @ApiOperation({ summary: 'Duyệt khóa học (dành cho Admin)' })
  approveCourse(@Param('id') id: string) {
    return this.coursesService.approveCourse(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/:id/publish')
  @ApiOperation({ summary: 'Publish khóa học (dành cho Admin)' })
  publishCourse(@Param('id') id: string) {
    return this.coursesService.approveCourse(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/:id/reject')
  @ApiOperation({ summary: 'Từ chối khóa học (dành cho Admin)' })
  rejectCourse(@Param('id') id: string) {
    return this.coursesService.rejectCourse(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/:id/hide')
  @ApiOperation({ summary: 'Ẩn khóa học khỏi marketplace (dành cho Admin)' })
  hideCourse(@Param('id') id: string) {
    return this.coursesService.hideCourse(id);
  }
}

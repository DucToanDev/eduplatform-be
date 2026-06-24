import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/users.schema';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả khóa học đã xuất bản (Public)' })
  findAllPublished() {
    return this.coursesService.findAllPublished();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Post()
  @ApiOperation({ summary: 'Tạo khóa học mới (dành cho Giáo viên)' })
  create(@Request() req, @Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(req.user.id, createCourseDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Get('teacher')
  @ApiOperation({ summary: 'Lấy danh sách khóa học của giáo viên (dành cho Giáo viên)' })
  findTeacherCourses(@Request() req) {
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
  update(@Param('id') id: string, @Request() req, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, req.user.id, updateCourseDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa khóa học (dành cho Giáo viên)' })
  remove(@Param('id') id: string, @Request() req) {
    return this.coursesService.remove(id, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Post(':id/request-publish')
  @ApiOperation({ summary: 'Yêu cầu duyệt xuất bản khóa học (dành cho Giáo viên)' })
  requestPublish(@Param('id') id: string, @Request() req) {
    return this.coursesService.requestPublish(id, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/pending')
  @ApiOperation({ summary: 'Lấy danh sách khóa học đang chờ duyệt (dành cho Admin)' })
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
  @Patch('admin/:id/reject')
  @ApiOperation({ summary: 'Từ chối khóa học (dành cho Admin)' })
  rejectCourse(@Param('id') id: string) {
    return this.coursesService.rejectCourse(id);
  }
}

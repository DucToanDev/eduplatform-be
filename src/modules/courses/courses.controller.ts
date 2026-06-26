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
import { Request } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthenticatedUser, JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/users.schema';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseQueryDto } from './dto/course-query.dto';
import { UpdateCourseStatusDto } from './dto/update-course-status.dto';

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  //Teacher: Tạo khóa học mới
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Giáo viên tạo khóa học mới' })
  @ApiCreatedResponse({ description: 'Tạo khóa học thành công' })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  create(
    @Body() dto: CreateCourseDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.coursesService.create(dto, req.user.id);
  }

  //Lấy khóa học của chính mình 
  
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Giáo viên lấy danh sách khóa học của chính mình' })
  @ApiOkResponse({ description: 'Thành công' })
  findMyCourses(
    @Query() query: CourseQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.coursesService.findByAuthor(req.user.id, query);
  }

  // Public: Lấy danh sách khóa học 
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách khóa học (filter theo category/status/marketplace/teacher)',
  })
  @ApiOkResponse({ description: 'Thành công' })
  findAll(@Query() query: CourseQueryDto) {
    return this.coursesService.findAll(query);
  }

  // Public: Lấy chi tiết khóa học 
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết khóa học' })
  @ApiOkResponse({ description: 'Thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy khóa học' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  //Teacher: Cập nhật thông tin khóa học
  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Cập nhật thông tin khóa học (chỉ tác giả)' })
  @ApiOkResponse({ description: 'Cập nhật thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy khóa học' })
  @ApiForbiddenResponse({ description: 'Không có quyền cập nhật' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.coursesService.update(id, dto, req.user.id);
  }

  //Admin/Manager: Duyệt/publish/reject khóa học
  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Admin/Manager duyệt, publish, reject hoặc ẩn khóa học' })
  @ApiOkResponse({ description: 'Cập nhật trạng thái thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy khóa học' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCourseStatusDto,
  ) {
    return this.coursesService.updateStatus(id, dto);
  }

  //Teacher: Xóa/ẩn khóa học
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Xóa/ẩn khóa học (soft delete, chỉ tác giả)' })
  @ApiOkResponse({ description: 'Xóa thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy khóa học' })
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.coursesService.remove(id, req.user.id);
  }
}

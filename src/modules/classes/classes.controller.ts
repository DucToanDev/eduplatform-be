import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
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
import { ClassesService } from './classes.service';
import { AddStudentToClassDto } from './dto/add-student-to-class.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@ApiTags('Classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Tạo lớp học mới (Dành cho Giáo viên)' })
  @ApiCreatedResponse({ description: 'Tạo lớp học thành công' })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  create(
    @Body() createClassDto: CreateClassDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.classesService.createClass(createClassDto, req.user.id);
  }

  @Get('student/me')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Lấy các lớp mà học sinh hiện tại đang tham gia' })
  getMyClasses(@Req() req: AuthenticatedRequest) {
    return this.classesService.getClassesByStudent(req.user.id);
  }

  @Get('teacher/:teacherId')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Lấy danh sách các lớp học của giáo viên' })
  @ApiOkResponse({ description: 'Thành công' })
  findAll(
    @Param('teacherId') paramTeacherId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.id !== paramTeacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền xem lớp học của giáo viên khác',
      );
    }

    return this.classesService.getClassesByTeacher(paramTeacherId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Lấy chi tiết lớp' })
  @ApiOkResponse({ description: 'Thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy lớp học' })
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.classesService.getClassDetail(id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Cập nhật lớp: tên, course_id, status' })
  @ApiOkResponse({ description: 'Cập nhật thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy lớp học' })
  update(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.classesService.updateClass(id, updateClassDto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Xóa lớp học' })
  @ApiOkResponse({ description: 'Xóa thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy lớp học' })
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.classesService.deleteClass(id, req.user.id);
  }

  @Post(':id/students')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Thêm học sinh vào lớp' })
  addStudent(
    @Param('id') id: string,
    @Body() dto: AddStudentToClassDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.classesService.addStudentToClass(id, dto, req.user.id);
  }

  @Delete(':id/students/:studentId')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Xóa học sinh khỏi lớp' })
  removeStudent(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.classesService.removeStudentFromClass(
      id,
      studentId,
      req.user.id,
    );
  }

  @Get(':id/enrollments')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Lấy danh sách enrollment của lớp' })
  getEnrollments(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.classesService.getClassEnrollments(id, req.user.id);
  }
}

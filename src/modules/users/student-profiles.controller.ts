import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './schemas/users.schema';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentProfileResponseDto } from './dto/profile-response.dto';
import { StudentListResponseDto } from './dto/student-list-response.dto';
import { StudentProfile } from './schemas/student-profile.schema';
import { UsersService } from './users.service';

@ApiTags('Student Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('student-profiles')
export class StudentProfilesController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Giáo viên tạo tài khoản học sinh' })
  @ApiCreatedResponse({
    description:
      'Tạo tài khoản học sinh thành công, trả về thông tin đăng nhập',
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu gửi lên không hợp lệ' })
  @ApiForbiddenResponse({
    description: 'Không có quyền truy cập (yêu cầu quyền Giáo viên)',
  })
  @ApiBearerAuth()
  createStudent(@Body() dto: CreateStudentDto, @Req() req: any) {
    const teacherId = req.user.id;
    return this.usersService.createStudent(dto, teacherId);
  }

  @Get('by-user/:userId')
  @ApiOperation({ summary: 'Lấy hồ sơ học sinh theo user id' })
  @ApiOkResponse({
    description: 'Lấy hồ sơ học sinh thành công',
    type: StudentProfileResponseDto,
  })
  @ApiBadRequestResponse({ description: 'User id không hợp lệ' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy hồ sơ học sinh' })
  getByUserId(
    @Param('userId') userId: string,
  ): Promise<StudentProfileResponseDto> {
    return this.usersService.getStudentProfileByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy hồ sơ học sinh theo profile id' })
  @ApiOkResponse({
    description: 'Lấy hồ sơ học sinh thành công',
    type: StudentProfileResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Profile id không hợp lệ' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy hồ sơ học sinh' })
  getById(@Param('id') id: string): Promise<StudentProfileResponseDto> {
    return this.usersService.getStudentProfile(id);
  }

  @Get('by-teacher/:id')
  @ApiOperation({ summary: 'Lấy danh sách toàn bộ học sinh theo teacher id' })
  @ApiOkResponse({
    description: 'Lấy danh sách hồ sơ học sinh thành công',
    type: [StudentListResponseDto],
  })
  @ApiBadRequestResponse({ description: 'teacher id không hợp lệ' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy hồ sơ học sinh' })
  getStudentsByTeacher(
    @Param('id') teacherId: string,
  ): Promise<StudentListResponseDto[]> {
    return this.usersService.getStudentsByTeacherId(teacherId);
  }

  @Get('by-class/:classId')
  @ApiOperation({ summary: 'Lấy danh sách học sinh theo class id' })
  @ApiOkResponse({
    description: 'Lấy danh sách hồ sơ học sinh thành công',
    type: [StudentListResponseDto],
  })
  @ApiBadRequestResponse({ description: 'class id không hợp lệ' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy lớp học' })
  getStudentsByClass(
    @Param('classId') classId: string,
  ): Promise<StudentListResponseDto[]> {
    return this.usersService.getStudentsByClassId(classId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật hồ sơ học sinh' })
  @ApiOkResponse({
    description: 'Cập nhật hồ sơ học sinh thành công',
    type: StudentProfile,
  })
  @ApiBadRequestResponse({
    description: 'Id hoặc dữ liệu gửi lên không hợp lệ',
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy hồ sơ học sinh' })
  update(
    @Param('id') id: string,
    @Body() updateStudentProfileDto: UpdateStudentProfileDto,
  ): Promise<StudentProfile> {
    return this.usersService.updateStudentProfile(id, updateStudentProfileDto);
  }
}

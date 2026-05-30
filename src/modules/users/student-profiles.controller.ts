import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { StudentProfileResponseDto } from './dto/profile-response.dto';
import { StudentProfile } from './schemas/student-profile.schema';
import { UsersService } from './users.service';

@ApiTags('Student Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('student-profiles')
export class StudentProfilesController {
  constructor(private readonly usersService: UsersService) {}

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

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
import { UpdateTeacherProfileDto } from './dto/update-teacher-profile.dto';
import { TeacherProfileResponseDto } from './dto/profile-response.dto';
import { TeacherProfile } from './schemas/teacher-profile.schema';
import { UsersService } from './users.service';

@ApiTags('Teacher Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teacher-profiles')
export class TeacherProfilesController {
  constructor(private readonly usersService: UsersService) {}

  @Get('by-user/:userId')
  @ApiOperation({ summary: 'Lấy hồ sơ giáo viên theo user id' })
  @ApiOkResponse({
    description: 'Lấy hồ sơ giáo viên thành công',
    type: TeacherProfileResponseDto,
  })
  @ApiBadRequestResponse({ description: 'User id không hợp lệ' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy hồ sơ giáo viên' })
  getByUserId(
    @Param('userId') userId: string,
  ): Promise<TeacherProfileResponseDto> {
    return this.usersService.getTeacherProfileByUserId(userId);
  }


  @Patch('by-user/:userId')
  @ApiOperation({ summary: 'Cập nhật hồ sơ giáo viên bằng user id' })
  @ApiOkResponse({
    description: 'Cập nhật hồ sơ giáo viên thành công',
  })
  @ApiBadRequestResponse({
    description: 'User Id hoặc dữ liệu gửi lên không hợp lệ',
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy hồ sơ giáo viên' })
  update(
    @Param('userId') userId: string,
    @Body() updateTeacherProfileDto: UpdateTeacherProfileDto,
  ): Promise<any> {
    return this.usersService.updateTeacherProfile(userId, updateTeacherProfileDto);
  }
}

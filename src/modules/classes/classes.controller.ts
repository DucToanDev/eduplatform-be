import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/users.schema';

@ApiTags('Classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo lớp học mới (Dành cho Giáo viên)' })
  @ApiCreatedResponse({ description: 'Tạo lớp học thành công' })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  create(@Body() createClassDto: CreateClassDto, @Req() req: any) {
    const teacherId = req.user.id;
    return this.classesService.createClass(createClassDto, teacherId);
  }

  @Get('teacher/:teacherId')
  @ApiOperation({ summary: 'Lấy danh sách các lớp học của giáo viên' })
  @ApiOkResponse({ description: 'Thành công' })
  findAll(@Param('teacherId') paramTeacherId: string, @Req() req: any) {
    const tokenTeacherId = req.user.id;
    
    if (tokenTeacherId !== paramTeacherId) {
      throw new ForbiddenException('Bạn không có quyền xem lớp học của giáo viên khác');
    }
    
    return this.classesService.getClassesByTeacher(paramTeacherId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật tên lớp học' })
  @ApiOkResponse({ description: 'Cập nhật thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy lớp học' })
  update(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
    @Req() req: any,
  ) {
    const tokenTeacherId = req.user.id;
    return this.classesService.updateClass(id, updateClassDto, tokenTeacherId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa lớp học' })
  @ApiOkResponse({ description: 'Xóa thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy lớp học' })
  remove(@Param('id') id: string, @Req() req: any) {
    const teacherId = req.user.id;
    return this.classesService.deleteClass(id, teacherId);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { LessonsService } from './lessons.service';

@ApiTags('Lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo một bài học mới' })
  create(@Request() req, @Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.create(createLessonDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả bài học có phân trang' })
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.lessonsService.findAll(paginationQuery);
  }

  @Get('class/:classId')
  @ApiOperation({
    summary: 'Lấy danh sách bài học theo ID lớp học có phân trang',
  })
  @ApiParam({
    name: 'classId',
    type: 'string',
    description: 'ID của lớp học',
  })
  findByClass(
    @Param('classId') classId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.lessonsService.findByClass(classId, paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một bài học theo ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID của bài học' })
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin bài học' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID của bài học' })
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(id, updateLessonDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bài học' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID của bài học' })
  remove(@Param('id') id: string, @Request() req) {
    return this.lessonsService.remove(id, req.user.id);
  }
}

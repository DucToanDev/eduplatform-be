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
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.create(createLessonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả bài học có phân trang' })
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.lessonsService.findAll(paginationQuery);
  }

  @Get('course/:courseId')
  @ApiOperation({
    summary: 'Lấy danh sách bài học theo ID khóa học có phân trang',
  })
  @ApiParam({
    name: 'courseId',
    type: 'string',
    description: 'ID của khóa học',
  })
  findByCourse(
    @Param('courseId') courseId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.lessonsService.findByCourse(courseId, paginationQuery);
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
  update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bài học' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID của bài học' })
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(id);
  }
}

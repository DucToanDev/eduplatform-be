import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 

@ApiTags('Lessons') // Phân nhóm trên Swagger UI
@ApiBearerAuth()    // Yêu cầu nhập token trên Swagger UI
@UseGuards(JwtAuthGuard)
@Controller('lessons')
export class LessonsController {
    constructor(private readonly lessonsService: LessonsService) { }

    @Post()
    @ApiOperation({ summary: 'Tạo một bài học mới' })
    create(@Request() req, @Body() createLessonDto: CreateLessonDto) {
        return this.lessonsService.create(createLessonDto, req.user.id);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách tất cả bài học (Có phân trang)' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Số trang' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng item mỗi trang' })
    findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
        return this.lessonsService.findAll(page || 1, limit || 10);
    }

    @Get('course/:courseId')
    @ApiOperation({ summary: 'Lấy danh sách bài học theo ID khóa học (Có phân trang)' })
    @ApiParam({ name: 'courseId', type: 'string', description: 'ID của khóa học' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Số trang' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng item mỗi trang' })
    findByCourse(
        @Param('courseId') courseId: string,
        @Query('page') page?: number, 
        @Query('limit') limit?: number
    ) {
        return this.lessonsService.findByCourse(courseId, page || 1, limit || 10);
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
    update(@Param('id') id: string, @Request() req, @Body() updateLessonDto: UpdateLessonDto) {
        return this.lessonsService.update(id, updateLessonDto, req.user.id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa bài học' })
    @ApiParam({ name: 'id', type: 'string', description: 'ID của bài học' })
    remove(@Param('id') id: string, @Request() req) {
        return this.lessonsService.remove(id, req.user.id);
    }
}
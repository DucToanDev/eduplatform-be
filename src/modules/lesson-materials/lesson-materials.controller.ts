import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/users.schema';
import { CreateLessonMaterialDto } from './dto/create-lesson-material.dto';
import { ReorderMaterialsDto } from './dto/reorder-materials.dto';
import { UpdateLessonMaterialDto } from './dto/update-lesson-material.dto';
import { LessonMaterialsService } from './lesson-materials.service';

@ApiTags('Lesson Materials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
@Controller('lesson-materials')
export class LessonMaterialsController {
  constructor(
    private readonly lessonMaterialsService: LessonMaterialsService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Thêm/upload tài liệu cho bài học (Giáo viên)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        lesson_id: { type: 'string', example: '60c72b2f9b1d8b001c8e4b5a' },
        material_type: { type: 'string', enum: ['IMG', 'DOCX', 'EXCEL'] },
        content_data: { type: 'string' },
        order_index: { type: 'number' },
        file: { type: 'string', format: 'binary' },
      },
      required: ['lesson_id', 'material_type'],
    },
  })
  @ApiCreatedResponse({ description: 'Thêm tài liệu thành công' })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bài học' })
  create(
    @Body() createLessonMaterialDto: CreateLessonMaterialDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.lessonMaterialsService.create(createLessonMaterialDto, file);
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Lấy danh sách tài liệu của một bài học' })
  @ApiOkResponse({ description: 'Thành công' })
  findByLesson(@Param('lessonId') lessonId: string) {
    return this.lessonMaterialsService.findByLesson(lessonId);
  }

  @Patch('lesson/:lessonId/reorder')
  @ApiOperation({ summary: 'Sắp xếp thứ tự tài liệu trong bài học' })
  @ApiOkResponse({ description: 'Sắp xếp thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy bài học' })
  reorder(
    @Param('lessonId') lessonId: string,
    @Body() reorderMaterialsDto: ReorderMaterialsDto,
  ) {
    return this.lessonMaterialsService.reorder(
      lessonId,
      reorderMaterialsDto.ordered_ids,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một tài liệu' })
  @ApiOkResponse({ description: 'Thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy tài liệu' })
  findOne(@Param('id') id: string) {
    return this.lessonMaterialsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật tài liệu (nội dung/order/loại)' })
  @ApiOkResponse({ description: 'Cập nhật thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy tài liệu' })
  update(
    @Param('id') id: string,
    @Body() updateLessonMaterialDto: UpdateLessonMaterialDto,
  ) {
    return this.lessonMaterialsService.update(id, updateLessonMaterialDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tài liệu khỏi bài học' })
  @ApiOkResponse({ description: 'Xóa thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy tài liệu' })
  remove(@Param('id') id: string) {
    return this.lessonMaterialsService.remove(id);
  }
}

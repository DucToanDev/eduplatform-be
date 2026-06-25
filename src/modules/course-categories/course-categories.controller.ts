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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/users.schema';
import { CourseCategoriesService } from './course-categories.service';
import { CreateCourseCategoryDto } from './dto/create-course-category.dto';
import { UpdateCourseCategoryDto } from './dto/update-course-category.dto';

@ApiTags('Course Categories')
@Controller('course-categories')
export class CourseCategoriesController {
  constructor(private readonly categoriesService: CourseCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách danh mục khóa học' })
  findAll(@Query('include_disabled') includeDisabled?: string) {
    return this.categoriesService.findAll(includeDisabled === 'true');
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Post()
  @ApiOperation({ summary: 'Admin/manager tạo danh mục khóa học' })
  create(@Body() dto: CreateCourseCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Patch(':id')
  @ApiOperation({ summary: 'Admin/manager cập nhật danh mục khóa học' })
  update(@Param('id') id: string, @Body() dto: UpdateCourseCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Patch(':id/disable')
  @ApiOperation({ summary: 'Admin/manager disable danh mục khóa học' })
  disable(@Param('id') id: string) {
    return this.categoriesService.disable(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Delete(':id')
  @ApiOperation({ summary: 'Admin/manager xóa/disable danh mục khóa học' })
  remove(@Param('id') id: string) {
    return this.categoriesService.disable(id);
  }
}

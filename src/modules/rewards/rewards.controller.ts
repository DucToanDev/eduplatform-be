import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/users.schema';
import { RewardsService } from './rewards.service';
import { CreateStoreItemDto, UpdateStoreItemDto } from './dto/store-item.dto';
import { AdjustPointsDto, RedeemItemDto } from './dto/reward.dto';
import { BulkQuestionRewardDto } from './dto/question-reward.dto';
import { LessonRewardConfigDto } from './dto/lesson-reward.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Rewards')
@ApiBearerAuth()
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  // Teacher/Admin APIs
  @ApiOperation({ summary: 'Tạo vật phẩm mới trong cửa hàng' })
  @Post('store')
  async createStoreItem(@Req() req: any, @Body() dto: CreateStoreItemDto) {
    const teacherId = req.user?.sub || req.user?.id || '60c72b2f9b1d8e001c8e4a11';
    return this.rewardsService.createStoreItem(teacherId, dto);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin vật phẩm' })
  @Patch('store/:id')
  async updateStoreItem(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateStoreItemDto) {
    const teacherId = req.user?.sub || req.user?.id || '60c72b2f9b1d8e001c8e4a11';
    return this.rewardsService.updateStoreItem(teacherId, id, dto);
  }

  @ApiOperation({ summary: 'Xóa vật phẩm khỏi cửa hàng' })
  @Delete('store/:id')
  async deleteStoreItem(@Req() req: any, @Param('id') id: string) {
    const teacherId = req.user?.sub || req.user?.id || '60c72b2f9b1d8e001c8e4a11';
    return this.rewardsService.deleteStoreItem(teacherId, id);
  }

  @ApiOperation({ summary: 'Cộng/Trừ điểm thủ công cho học sinh' })
  @Patch('points/:studentId/adjust')
  async adjustPoints(@Param('studentId') studentId: string, @Body() dto: AdjustPointsDto) {
    return this.rewardsService.adjustPoints(studentId, dto.amount);
  }

  @ApiOperation({ summary: 'Cấu hình điểm thưởng cho nhiều câu hỏi' })
  @Post('questions-config')
  async configureQuestions(@Req() req: any, @Body() dto: BulkQuestionRewardDto) {
    const teacherId = req.user?.sub || req.user?.id || '60c72b2f9b1d8e001c8e4a11';
    return this.rewardsService.bulkConfigureQuestions(teacherId, dto.items);
  }

  @ApiOperation({ summary: 'Cấu hình điểm thưởng cho Bài học' })
  @Post('lessons-config')
  async configureLessonReward(@Req() req: any, @Body() dto: LessonRewardConfigDto) {
    const teacherId = req.user?.sub || req.user?.id || '60c72b2f9b1d8e001c8e4a11';
    return this.rewardsService.configureLessonReward(teacherId, dto.lesson_id, dto.reward_points);
  }

  // Student APIs
  @ApiOperation({ summary: 'Lấy danh sách vật phẩm đang bán' })
  @Get('store')
  async getActiveStoreItems() {
    return this.rewardsService.getActiveStoreItems();
  }

  @ApiOperation({ summary: 'Xem chi tiết một vật phẩm' })
  @Get('store/:id')
  async getStoreItemById(@Param('id') id: string) {
    return this.rewardsService.getStoreItemById(id);
  }

  @ApiOperation({ summary: 'Xem số dư điểm thưởng của học sinh' })
  @Get('balance')
  async getBalance(@Req() req: any) {
    const studentId = req.user?.sub || req.user?.id || '60c72b2f9b1d8e001c8e4a22';
    return this.rewardsService.getBalance(studentId);
  }

  @ApiOperation({ summary: 'Đổi điểm lấy vật phẩm' })
  @Post('redeem')
  async redeemItem(@Req() req: any, @Body() dto: RedeemItemDto) {
    const studentId = req.user?.sub || req.user?.id || '60c72b2f9b1d8e001c8e4a22';
    return this.rewardsService.redeemItem(studentId, dto.item_id);
  }

  @ApiOperation({ summary: 'Xem kho đồ của học sinh' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.MANAGER)
  @Get('inventory')
  async getInventory(@Req() req: any) {
    const studentId = req.user?.sub || req.user?.id || '60c72b2f9b1d8e001c8e4a22';
    return this.rewardsService.getStudentInventory(studentId);
  }

  @ApiOperation({ summary: 'Bật/Tắt sử dụng vật phẩm trong kho' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.MANAGER)
  @Patch('inventory/:id/toggle')
  async toggleInventoryItem(@Req() req: any, @Param('id') id: string) {
    const studentId = req.user?.sub || req.user?.id || '60c72b2f9b1d8e001c8e4a22';
    return this.rewardsService.toggleInventoryItem(studentId, id);
  }

  @ApiOperation({ summary: 'Nhận điểm thưởng sau khi làm xong Quiz' })
  @Post('claim-quiz/:submissionId')
  async claimQuizReward(@Req() req: any, @Param('submissionId') submissionId: string) {
    const studentId = req.user?.sub || req.user?.id || '60c72b2f9b1d8e001c8e4a22';
    return this.rewardsService.claimQuizReward(studentId, submissionId);
  }

  @ApiOperation({ summary: 'Nhận điểm thưởng sau khi học xong Bài học' })
  @Post('claim-lesson/:lessonId')
  async claimLessonReward(@Req() req: any, @Param('lessonId') lessonId: string) {
    const studentId = req.user?.sub || req.user?.id || '60c72b2f9b1d8e001c8e4a22';
    return this.rewardsService.claimLessonReward(studentId, lessonId);
  }
}

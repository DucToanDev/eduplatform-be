import { Controller, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { LearningRewardsService } from './learning-rewards.service';
import { BulkQuestionRewardDto } from './dto/question-reward.dto';
import { LessonRewardConfigDto } from './dto/lesson-reward.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/users.schema';

@ApiTags('Learning Rewards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('learning-rewards')
export class LearningRewardsController {
  constructor(
    private readonly learningRewardsService: LearningRewardsService,
  ) {}

  @ApiOperation({ summary: 'Cấu hình điểm thưởng cho nhiều câu hỏi' })
  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.MANAGER)
  @Post('questions-config')
  async configureQuestions(
    @Req() req: any,
    @Body() dto: BulkQuestionRewardDto,
  ) {
    const teacherId = req.user.id;
    return this.learningRewardsService.bulkConfigureQuestions(
      teacherId,
      dto.items,
    );
  }

  @ApiOperation({ summary: 'Cấu hình điểm thưởng cho Bài học' })
  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.MANAGER)
  @Post('lessons-config')
  async configureLessonReward(
    @Req() req: any,
    @Body() dto: LessonRewardConfigDto,
  ) {
    const teacherId = req.user.id;
    return this.learningRewardsService.configureLessonReward(
      teacherId,
      dto.lesson_id,
      dto.reward_points,
    );
  }

  @ApiOperation({ summary: 'Nhận điểm thưởng sau khi làm xong Quiz' })
  @Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.MANAGER)
  @Post('claim-quiz/:submissionId')
  async claimQuizReward(
    @Req() req: any,
    @Param('submissionId') submissionId: string,
  ) {
    const studentId = req.user.id;
    return this.learningRewardsService.claimQuizReward(studentId, submissionId);
  }

  @ApiOperation({ summary: 'Nhận điểm thưởng sau khi học xong Bài học' })
  @Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.MANAGER)
  @Post('claim-lesson/:lessonId')
  async claimLessonReward(
    @Req() req: any,
    @Param('lessonId') lessonId: string,
  ) {
    const studentId = req.user.id;
    return this.learningRewardsService.claimLessonReward(studentId, lessonId);
  }
}

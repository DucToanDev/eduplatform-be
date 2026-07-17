import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import { Achievement, AchievementDocument } from './schemas/achievement.schema';
import { StudentAchievement, StudentAchievementDocument } from './schemas/student-achievement.schema';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { PointsService } from '../points/points.service';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectModel(Achievement.name) private achievementModel: Model<AchievementDocument>,
    @InjectModel(StudentAchievement.name) private studentAchievementModel: Model<StudentAchievementDocument>,
    private pointsService: PointsService,
  ) {}

  async create(createDto: CreateAchievementDto) {
    return new this.achievementModel(createDto).save();
  }

  async findAll() {
    return this.achievementModel.find().exec();
  }

  async update(id: string, updateDto: UpdateAchievementDto) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('ID không hợp lệ');
    return this.achievementModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('ID không hợp lệ');
    return this.achievementModel.findByIdAndDelete(id).exec();
  }

  async getMyAchievements(studentId: string) {
    return this.studentAchievementModel
      .find({ student_id: new Types.ObjectId(studentId) })
      .populate('achievement_id')
      .exec();
  }

  // Event Listeners
  @OnEvent('user.login')
  async handleUserLogin(payload: { studentId: string; login_streak: number; is_first_login: boolean; day_of_week: number }) {
    const { studentId, login_streak, is_first_login, day_of_week } = payload;
    
    if (is_first_login) {
      const firstLoginAch = await this.achievementModel.find({ condition_type: 'FIRST_LOGIN' }).exec();
      for (const ach of firstLoginAch) await this.checkAndGrant(studentId, ach);
    }
    
    const streakAch = await this.achievementModel.find({ condition_type: 'LOGIN_STREAK' }).exec();
    for (const ach of streakAch) {
      if (login_streak >= ach.condition_value) await this.checkAndGrant(studentId, ach);
    }

    if (day_of_week === 0 || day_of_week === 6) {
      const weekendAch = await this.achievementModel.find({ condition_type: 'WEEKEND_WARRIOR' }).exec();
      for (const ach of weekendAch) await this.checkAndGrant(studentId, ach);
    }
  }

  @OnEvent('user.avatar_updated')
  async handleAvatarUpdated(payload: { studentId: string }) {
    const { studentId } = payload;
    const achievements = await this.achievementModel.find({ condition_type: 'AVATAR_UPDATED' }).exec();
    for (const ach of achievements) await this.checkAndGrant(studentId, ach);
  }

  @OnEvent('lesson.completed')
  async handleLessonCompleted(payload: { studentId: string; total_completed_lessons: number }) {
    const { studentId, total_completed_lessons } = payload;
    const achievements = await this.achievementModel.find({ condition_type: 'LESSONS_COMPLETED' }).exec();
    for (const ach of achievements) {
      if (total_completed_lessons >= ach.condition_value) await this.checkAndGrant(studentId, ach);
    }
  }

  @OnEvent('quiz.submitted')
  async handleQuizSubmitted(payload: { studentId: string; score_percentage: number; is_early_submission: boolean; day_of_week: number }) {
    const { studentId, score_percentage, is_early_submission, day_of_week } = payload;
    
    const scoreAch = await this.achievementModel.find({ condition_type: 'QUIZ_SCORE' }).exec();
    for (const ach of scoreAch) {
      if (score_percentage >= ach.condition_value) await this.checkAndGrant(studentId, ach);
    }

    if (is_early_submission) {
      const earlyAch = await this.achievementModel.find({ condition_type: 'QUIZ_EARLY_SUBMIT' }).exec();
      for (const ach of earlyAch) await this.checkAndGrant(studentId, ach);
    }

    if (day_of_week === 0 || day_of_week === 6) {
      const weekendAch = await this.achievementModel.find({ condition_type: 'WEEKEND_WARRIOR' }).exec();
      for (const ach of weekendAch) await this.checkAndGrant(studentId, ach);
    }
  }

  // Core logic to grant achievement
  private async checkAndGrant(studentId: string, achievement: AchievementDocument) {
    // Check if already granted
    const exists = await this.studentAchievementModel.findOne({
      student_id: new Types.ObjectId(studentId),
      achievement_id: achievement._id,
    });
    if (exists) return; // Already has it

    // Grant it
    await new this.studentAchievementModel({
      student_id: new Types.ObjectId(studentId),
      achievement_id: achievement._id,
    }).save();

    // Reward points
    if (achievement.point_reward > 0) {
      await this.pointsService.adjustPoints(studentId, achievement.point_reward);
    }
  }
}

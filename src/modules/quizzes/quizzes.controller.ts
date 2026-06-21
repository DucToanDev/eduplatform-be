import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/users.schema';

@ApiTags('Quizzes')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Post()
  @ApiOperation({ summary: 'Tạo bài Quiz mới (dành cho Giáo viên)' })
  createQuiz(@Request() req, @Body() createQuizDto: CreateQuizDto) {
    return this.quizzesService.createQuiz(createQuizDto, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Post('questions')
  @ApiOperation({ summary: 'Thêm câu hỏi vào Quiz (dành cho Giáo viên)' })
  createQuestion(@Request() req, @Body() createQuestionDto: CreateQuestionDto) {
    return this.quizzesService.createQuestion(createQuestionDto, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('course/:courseId')
  @ApiOperation({ summary: 'Lấy danh sách Quiz (Bài kiểm tra định kỳ) của một Khóa học' })
  getQuizzesByCourse(@Param('courseId') courseId: string) {
    return this.quizzesService.getQuizzesByCourse(courseId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Lấy danh sách Quiz (Bài tập ngắn) của một Bài học' })
  getQuizzesByLesson(@Param('lessonId') lessonId: string) {
    return this.quizzesService.getQuizzesByLesson(lessonId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin Quiz và danh sách câu hỏi (không kèm đáp án)' })
  getQuizDetails(@Param('id') id: string) {
    return this.quizzesService.getQuizDetails(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post(':id/submit')
  @ApiOperation({ summary: 'Học sinh nộp bài Quiz và nhận điểm' })
  submitQuiz(
    @Param('id') id: string, 
    @Body() body: { answers: { question_id: string, selected_index: number }[] }
  ) {
    return this.quizzesService.submitQuiz(id, body.answers);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
  Delete,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
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
  @ApiOperation({
    summary: 'Lấy danh sách Quiz (Bài kiểm tra định kỳ) của một Khóa học',
  })
  getQuizzesByCourse(@Param('courseId') courseId: string) {
    return this.quizzesService.getQuizzesByCourse(courseId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('lesson/:lessonId')
  @ApiOperation({
    summary: 'Lấy danh sách Quiz (Bài tập ngắn) của một Bài học',
  })
  getQuizzesByLesson(@Param('lessonId') lessonId: string) {
    return this.quizzesService.getQuizzesByLesson(lessonId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin Quiz và danh sách câu hỏi (không kèm đáp án)',
  })
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
    @Request() req,
    @Body()
    body: { answers: { question_id: string; selected_index: number }[] },
  ) {
    return this.quizzesService.submitQuiz(id, body.answers, req.user.id);
  }

  // --- QUESTION BANK & QUESTION CRUD ---

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Get('questions/bank/course/:courseId')
  @ApiOperation({ summary: 'Lấy ngân hàng câu hỏi của Khóa học (Giáo viên)' })
  getQuestionBankByCourse(
    @Param('courseId') courseId: string,
    @Query() paginationQuery: PaginationQueryDto,
    @Request() req,
  ) {
    return this.quizzesService.getQuestionBankByCourse(
      courseId,
      req.user.id,
      paginationQuery,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Get('questions/:id')
  @ApiOperation({ summary: 'Lấy chi tiết 1 câu hỏi (Giáo viên)' })
  getQuestionById(@Param('id') id: string) {
    return this.quizzesService.getQuestionById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Patch('questions/:id')
  @ApiOperation({ summary: 'Cập nhật nội dung/đáp án câu hỏi (Giáo viên)' })
  updateQuestion(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @Request() req,
  ) {
    return this.quizzesService.updateQuestion(
      id,
      updateQuestionDto,
      req.user.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Delete('questions/:id')
  @ApiOperation({ summary: 'Xóa câu hỏi khỏi Quiz (Giáo viên)' })
  deleteQuestion(@Param('id') id: string, @Request() req) {
    return this.quizzesService.deleteQuestion(id, req.user.id);
  }

  // --- SUBMISSIONS ---

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('submissions/history')
  @ApiOperation({ summary: 'Lấy danh sách lịch sử nộp bài của học sinh' })
  getStudentSubmissions(
    @Query() paginationQuery: PaginationQueryDto,
    @Request() req,
  ) {
    return this.quizzesService.getStudentSubmissions(
      req.user.id,
      paginationQuery,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('submissions/:id')
  @ApiOperation({ summary: 'Xem chi tiết 1 bài nộp (Đúng/Sai)' })
  getSubmissionDetails(@Param('id') id: string, @Request() req) {
    return this.quizzesService.getSubmissionDetails(id, req.user.id);
  }
}

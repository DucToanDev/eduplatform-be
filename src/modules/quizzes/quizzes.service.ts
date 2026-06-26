import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { buildPaginatedResponse, getPaginationSkip } from '../../common/utils/pagination.util';
import { Quiz, QuizDocument, QuizType } from './schemas/quiz.schema';
import { Question, QuestionDocument } from './schemas/question.schema';
import { QuizSubmission, QuizSubmissionDocument } from './schemas/quiz-submission.schema';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { LessonsService } from '../lesson/lessons.service';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>,
    @InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>,
    @InjectModel(QuizSubmission.name) private readonly quizSubmissionModel: Model<QuizSubmissionDocument>,
    private readonly lessonsService: LessonsService,
  ) { }

  private async checkQuizOwnershipByQuizDoc(quiz: Quiz, authorId: string) {
    if (quiz.quiz_type === QuizType.COURSE_EXAM) {
      if (!quiz.course_id) throw new BadRequestException('course_id là bắt buộc');
      await this.lessonsService.checkClassOwnership(quiz.course_id.toString(), authorId);
    } else {
      if (!quiz.lesson_id) throw new BadRequestException('lesson_id là bắt buộc');
      const lesson = await this.lessonsService.findOne(quiz.lesson_id.toString());
      await this.lessonsService.checkClassOwnership(lesson.class_id.toString(), authorId);
    }
  }

  async createQuiz(createQuizDto: CreateQuizDto, authorId: string): Promise<Quiz> {
    if (createQuizDto.quiz_type === QuizType.COURSE_EXAM) {
      if (!createQuizDto.course_id) throw new BadRequestException('course_id là bắt buộc đối với COURSE_EXAM');
      await this.lessonsService.checkClassOwnership(createQuizDto.course_id, authorId);
    } else {
      if (!createQuizDto.lesson_id) throw new BadRequestException('lesson_id là bắt buộc đối với LESSON_QUIZ');
      const lesson = await this.lessonsService.findOne(createQuizDto.lesson_id);
      await this.lessonsService.checkClassOwnership(lesson.class_id.toString(), authorId);
    }

    const newQuiz = new this.quizModel(createQuizDto);
    return newQuiz.save();
  }

  async findQuizById(id: string): Promise<QuizDocument> {
    const quiz = await this.quizModel.findById(id).exec();
    if (!quiz) {
      throw new NotFoundException('Không tìm thấy bài Quiz');
    }
    return quiz;
  }

  async createQuestion(createQuestionDto: CreateQuestionDto, authorId: string): Promise<Question> {
    const quiz = await this.findQuizById(createQuestionDto.quiz_id);
    await this.checkQuizOwnershipByQuizDoc(quiz, authorId);

    const newQuestion = new this.questionModel(createQuestionDto);
    return newQuestion.save();
  }

  async getQuizzesByCourse(courseId: string): Promise<Quiz[]> {
    return this.quizModel.find({ course_id: courseId, quiz_type: QuizType.COURSE_EXAM }).sort({ order_index: 1 }).exec();
  }

  async getQuizzesByLesson(lessonId: string): Promise<Quiz[]> {
    return this.quizModel.find({ lesson_id: lessonId, quiz_type: QuizType.LESSON_QUIZ }).exec();
  }

  async getQuestionsByQuiz(quizId: string): Promise<Question[]> {
    return this.questionModel.find({ quiz_id: quizId }).select('-correct_option_index').exec();
  }

  async getQuizDetails(quizId: string): Promise<any> {
    const quiz = await this.findQuizById(quizId);
    const questions = await this.getQuestionsByQuiz(quizId);
    return { ...quiz.toObject(), questions };
  }

  // --- QUESTION BANK & QUESTION CRUD ---

  async getQuestionBankByCourse(courseId: string, authorId: string, paginationQuery: PaginationQueryDto): Promise<PaginatedResponse<Question>> {
    await this.lessonsService.checkClassOwnership(courseId, authorId);

    const courseQuizzes = await this.quizModel.find({ course_id: new Types.ObjectId(courseId) }).select('_id').exec();
    const lessonIds = await this.lessonsService.findAllIdsByClass(courseId);
    const lessonQuizzes = await this.quizModel.find({ lesson_id: { $in: lessonIds.map(id => new Types.ObjectId(id)) } }).select('_id').exec();

    const allQuizIds = [...courseQuizzes.map(q => q._id), ...lessonQuizzes.map(q => q._id)];

    const skip = getPaginationSkip(paginationQuery);
    const filter = { quiz_id: { $in: allQuizIds } };

    const [data, total] = await Promise.all([
      this.questionModel
        .find(filter)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(paginationQuery.limit)
        .exec(),
      this.questionModel.countDocuments(filter),
    ]);

    return buildPaginatedResponse(data, total, paginationQuery);
  }

  async getQuestionById(id: string): Promise<QuestionDocument> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Id không hợp lệ');
    const question = await this.questionModel.findById(id).exec();
    if (!question) throw new NotFoundException('Không tìm thấy câu hỏi');
    return question;
  }

  async updateQuestion(id: string, updateQuestionDto: UpdateQuestionDto, authorId: string): Promise<Question> {
    const question = await this.getQuestionById(id);
    const quiz = await this.findQuizById(question.quiz_id.toString());
    await this.checkQuizOwnershipByQuizDoc(quiz, authorId);

    const updated = await this.questionModel.findByIdAndUpdate(id, updateQuestionDto, { new: true, runValidators: true }).exec();
    if (!updated) throw new NotFoundException('Không tìm thấy câu hỏi');
    return updated;
  }

  async deleteQuestion(id: string, authorId: string): Promise<void> {
    const question = await this.getQuestionById(id);
    const quiz = await this.findQuizById(question.quiz_id.toString());
    await this.checkQuizOwnershipByQuizDoc(quiz, authorId);

    await this.questionModel.findByIdAndDelete(id).exec();
  }

  // --- SUBMISSIONS ---

  async submitQuiz(quizId: string, answers: { question_id: string, selected_index: number }[], studentId: string): Promise<any> {
    if (!Types.ObjectId.isValid(quizId)) throw new BadRequestException('Id không hợp lệ');

    const questions = await this.questionModel.find({ quiz_id: new Types.ObjectId(quizId) }).exec();

    let score = 0;
    const total = questions.length;

    const submissionAnswers = answers.map(ans => {
      const q = questions.find(q => q._id.toString() === ans.question_id);
      const is_correct = q ? (q.correct_option_index === ans.selected_index) : false;
      if (is_correct) score += 1;
      return {
        question_id: ans.question_id,
        selected_index: ans.selected_index,
        is_correct: is_correct,
        correct_option_index: q ? q.correct_option_index : -1
      };
    });

    const filter = {
      quiz_id: new Types.ObjectId(quizId),
      student_id: new Types.ObjectId(studentId),
    };

    const update = {
      answers: submissionAnswers,
      score: score,
      submitted_at: new Date()
    };

    const submission = await this.quizSubmissionModel.findOneAndUpdate(filter, update, { new: true, upsert: true }).exec();

    return {
      submission_id: submission._id,
      total_questions: total,
      correct_answers: score,
      score_percentage: total > 0 ? (score / total) * 100 : 0,
    };
  }

  async getStudentSubmissions(studentId: string, paginationQuery: PaginationQueryDto): Promise<PaginatedResponse<QuizSubmission>> {
    const skip = getPaginationSkip(paginationQuery);
    const filter = { student_id: new Types.ObjectId(studentId) };

    const [data, total] = await Promise.all([
      this.quizSubmissionModel
        .find(filter)
        .sort({ submitted_at: -1 })
        .populate('quiz_id', 'title quiz_type')
        .skip(skip)
        .limit(paginationQuery.limit)
        .exec(),
      this.quizSubmissionModel.countDocuments(filter),
    ]);

    return buildPaginatedResponse(data, total, paginationQuery);
  }

  async getSubmissionDetails(submissionId: string, userId: string): Promise<any> {
    if (!Types.ObjectId.isValid(submissionId)) throw new BadRequestException('Id không hợp lệ');

    const submission = await this.quizSubmissionModel.findById(submissionId).populate('quiz_id', 'title quiz_type').exec();
    if (!submission) throw new NotFoundException('Không tìm thấy lịch sử nộp bài');

    // Only student or teacher check could be added here, currently returning for MVP
    return submission;
  }
}

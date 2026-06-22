import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz, QuizDocument, QuizType } from './schemas/quiz.schema';
import { Question, QuestionDocument } from './schemas/question.schema';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { LessonsService } from '../lesson/lessons.service';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>,
    @InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>,
    private readonly lessonsService: LessonsService,
  ) {}

  private async checkQuizOwnershipByQuizDoc(quiz: Quiz, authorId: string) {
    if (quiz.quiz_type === QuizType.COURSE_EXAM) {
      if (!quiz.course_id) throw new BadRequestException('course_id là bắt buộc');
      await this.lessonsService.checkCourseOwnership(quiz.course_id.toString(), authorId);
    } else {
      if (!quiz.lesson_id) throw new BadRequestException('lesson_id là bắt buộc');
      const lesson = await this.lessonsService.findOne(quiz.lesson_id.toString());
      await this.lessonsService.checkCourseOwnership(lesson.course_id.toString(), authorId);
    }
  }

  async createQuiz(createQuizDto: CreateQuizDto, authorId: string): Promise<Quiz> {
    if (createQuizDto.quiz_type === QuizType.COURSE_EXAM) {
      if (!createQuizDto.course_id) throw new BadRequestException('course_id là bắt buộc đối với COURSE_EXAM');
      await this.lessonsService.checkCourseOwnership(createQuizDto.course_id, authorId);
    } else {
      if (!createQuizDto.lesson_id) throw new BadRequestException('lesson_id là bắt buộc đối với LESSON_QUIZ');
      const lesson = await this.lessonsService.findOne(createQuizDto.lesson_id);
      await this.lessonsService.checkCourseOwnership(lesson.course_id.toString(), authorId);
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

  async submitQuiz(quizId: string, answers: { question_id: string, selected_index: number }[]): Promise<any> {
    const questions = await this.questionModel.find({ quiz_id: quizId }).exec();
    
    let score = 0;
    const total = questions.length;

    for (const answer of answers) {
      const q = questions.find(q => q._id.toString() === answer.question_id);
      if (q && q.correct_option_index === answer.selected_index) {
        score += 1;
      }
    }

    return {
      total_questions: total,
      correct_answers: score,
      score_percentage: total > 0 ? (score / total) * 100 : 0,
    };
  }
}

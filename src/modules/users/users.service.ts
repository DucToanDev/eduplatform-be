import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import {
  buildPaginatedResponse,
  getPaginationSkip,
} from '../../common/utils/pagination.util';
import { UploadsService } from '../uploads/uploads.service';
import { AvatarResponseDto } from './dto/avatar-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  ProfileUserResponseDto,
  StudentProfileResponseDto,
  TeacherProfileResponseDto,
} from './dto/profile-response.dto';
import {
  StudentProfile,
  StudentProfileDocument,
} from './schemas/student-profile.schema';
import {
  TeacherProfile,
  TeacherProfileDocument,
} from './schemas/teacher-profile.schema';
import { Users, UsersDocument, UserRole } from './schemas/users.schema';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { UpdateTeacherProfileDto } from './dto/update-teacher-profile.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import {
  ClassEnrollment,
  ClassEnrollmentDocument,
} from '../classes/schemas/class-enrollment.schema';
import { UpdateCurrentUserDto } from './dto/update-current-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UserQueryDto } from './dto/user-query.dto';

const AVATAR_UPLOAD_FOLDER = 'edu-platform/avatars';

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

type StudentAccountSummary = {
  id: string;
  fullname: string;
  username: string;
  avatar_url: string;
  password?: string;
};

type EnrollmentWithStudent = ClassEnrollmentDocument & {
  student_id: UsersDocument;
};

type StudentProfileWithUser = StudentProfileDocument & {
  user_id: UsersDocument;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name)
    private readonly userModel: Model<UsersDocument>,
    @InjectModel(StudentProfile.name)
    private readonly studentProfileModel: Model<StudentProfileDocument>,
    @InjectModel(TeacherProfile.name)
    private readonly teacherProfileModel: Model<TeacherProfileDocument>,
    @InjectModel(ClassEnrollment.name)
    private readonly classEnrollmentModel: Model<ClassEnrollmentDocument>,
    private readonly uploadsService: UploadsService,
  ) {}

  async updateAvatar(
    id: string,
    avatar: Express.Multer.File,
    currentUserId: string,
  ): Promise<AvatarResponseDto> {
    this.validateObjectId(id);

    if (id !== currentUserId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật avatar này');
    }

    const uploadResult = await this.uploadsService.uploadImage(
      avatar,
      AVATAR_UPLOAD_FOLDER,
    );
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { avatar_url: uploadResult.secure_url },
      {
        returnDocument: 'after',
        runValidators: true,
      },
    );

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return {
      message: 'Cập nhật avatar thành công',
      avatar_url: user.avatar_url,
    };
  }

  async getCurrentUser(id: string): Promise<ProfileUserResponseDto> {
    const user = await this.findUserDocument(id);
    return this.buildUserResponse(user);
  }

  async updateCurrentUser(
    id: string,
    dto: UpdateCurrentUserDto,
  ): Promise<ProfileUserResponseDto> {
    this.validateObjectId(id);

    const user = await this.userModel.findByIdAndUpdate(id, dto, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return this.buildUserResponse(user);
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.findUserDocument(id);
    const isPasswordMatches = await bcrypt.compare(
      dto.current_password,
      user.password,
    );

    if (!isPasswordMatches) {
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    }

    user.password = await bcrypt.hash(dto.new_password, 10);
    user.raw_password = undefined;
    await user.save();

    return { message: 'Đổi mật khẩu thành công' };
  }

  async findAllUsers(query: UserQueryDto) {
    const filter = this.buildUserFilter(query);
    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password -raw_password')
        .sort({ createdAt: -1, _id: -1 })
        .skip(getPaginationSkip(query))
        .limit(query.limit)
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  async findUserById(id: string) {
    this.validateObjectId(id);

    const user = await this.userModel
      .findById(id)
      .select('-password -raw_password');

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return user;
  }

  async updateUserStatus(id: string, dto: UpdateUserStatusDto) {
    this.validateObjectId(id);

    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { status: dto.status },
        { returnDocument: 'after', runValidators: true },
      )
      .select('-password -raw_password');

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return user;
  }

  async updateUserRole(id: string, dto: UpdateUserRoleDto) {
    this.validateObjectId(id);

    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { role: dto.role },
        { returnDocument: 'after', runValidators: true },
      )
      .select('-password -raw_password');

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return user;
  }

  async getStudentProfile(id: string): Promise<StudentProfileResponseDto> {
    this.validateObjectId(id);

    const profile = await this.studentProfileModel.findById(id);

    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ học sinh');
    }

    return this.buildStudentProfileResponse(profile);
  }

  async getStudentProfileByUserId(
    userId: string,
  ): Promise<StudentProfileResponseDto> {
    this.validateObjectId(userId);

    const profile = await this.studentProfileModel.findOne({
      user_id: new Types.ObjectId(userId),
    });

    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ học sinh');
    }

    return this.buildStudentProfileResponse(profile);
  }

  async getTeacherProfileByUserId(
    userId: string,
  ): Promise<TeacherProfileResponseDto> {
    this.validateObjectId(userId);

    const profile = await this.teacherProfileModel.findOne({
      user_id: new Types.ObjectId(userId),
    });

    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ giáo viên');
    }

    return this.buildTeacherProfileResponse(profile);
  }

  async updateStudentProfile(
    id: string,
    updateStudentProfileDto: UpdateStudentProfileDto,
  ): Promise<StudentProfile> {
    this.validateObjectId(id);

    const profile = await this.studentProfileModel.findByIdAndUpdate(
      id,
      updateStudentProfileDto,
      {
        returnDocument: 'after',
        runValidators: true,
      },
    );

    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ học sinh');
    }

    return profile;
  }

  async updateTeacherProfile(
    userId: string,
    updateTeacherProfileDto: UpdateTeacherProfileDto,
  ): Promise<any> {
    this.validateObjectId(userId);

    const { phone, ...profileDto } = updateTeacherProfileDto;

    const profile = await this.teacherProfileModel.findOneAndUpdate(
      { user_id: new Types.ObjectId(userId) },
      profileDto,
      {
        returnDocument: 'after',
        runValidators: true,
        upsert: true,
      },
    );

    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ giáo viên');
    }

    let updatedPhone = phone;
    if (phone !== undefined) {
      await this.userModel.findByIdAndUpdate(profile.user_id, { phone });
    } else {
      const user = await this.userModel
        .findById(profile.user_id)
        .select('phone');
      updatedPhone = user?.phone;
    }

    return {
      bio: profile.bio,
      expertise: profile.expertise,
      experience_years: profile.experience_years,
      phone: updatedPhone,
    };
  }

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }
  }

  private async findUserDocument(id: string): Promise<UsersDocument> {
    this.validateObjectId(id);

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return user;
  }

  private buildUserFilter(query: UserQueryDto): QueryFilter<UsersDocument> {
    const filter: QueryFilter<UsersDocument> = {};

    if (query.role) {
      filter.role = query.role;
    }

    if (query.status !== undefined) {
      if (query.status !== 'true' && query.status !== 'false') {
        throw new BadRequestException('Status phải là true hoặc false');
      }
      filter.status = query.status === 'true';
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { fullname: searchRegex },
        { email: searchRegex },
        { username: searchRegex },
        { phone: searchRegex },
      ];
    }

    return filter;
  }

  private async buildTeacherProfileResponse(
    profile: TeacherProfileDocument,
  ): Promise<TeacherProfileResponseDto> {
    const user = await this.findProfileUser(profile.user_id);

    return {
      id: String(profile._id),
      user: this.buildUserResponse(user),
      profile: {
        bio: profile.bio,
        expertise: profile.expertise,
        experience_years: profile.experience_years,
      },
    };
  }

  private async buildStudentProfileResponse(
    profile: StudentProfileDocument,
  ): Promise<StudentProfileResponseDto> {
    const user = await this.findProfileUser(profile.user_id);

    return {
      id: String(profile._id),
      user: this.buildUserResponse(user),
      profile: {
        date_of_birth: profile.date_of_birth,
        grade_level: profile.grade_level,
        parent_phone: profile.parent_phone,
        points: profile.points,
        parent_access_codes: profile.parent_access_codes,
      },
    };
  }

  async createStudent(dto: CreateStudentDto, teacherId: string) {
    const username =
      dto.username ||
      `hs${Math.floor(Math.random() * 10000)}${Date.now().toString().slice(-4)}`;
    const passwordText = dto.password || Math.random().toString(36).slice(-6);
    const hashedPassword = await bcrypt.hash(passwordText, 10);

    try {
      const user = await this.userModel.create({
        fullname: dto.fullname,
        username: username,
        gender: dto.gender,
        password: hashedPassword,
        raw_password: passwordText,
        role: UserRole.STUDENT,
      });

      const usernamePrefix = username.substring(0, 2).toUpperCase();
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const parentAccessCode = `PH${usernamePrefix}${randomDigits}`;

      await this.studentProfileModel.create({
        user_id: user._id,
        grade_level: dto.grade_level,
        teacher_id: new Types.ObjectId(teacherId),
        parent_access_codes: parentAccessCode,
      });

      if (dto.class_ids && dto.class_ids.length > 0) {
        const enrollments = dto.class_ids.map((classId) => ({
          student_id: user._id,
          class_id: new Types.ObjectId(classId),
        }));
        await this.classEnrollmentModel.insertMany(enrollments);
      }

      return {
        status: 200,
        message: 'Tạo tài khoản học sinh thành công',
      };
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        throw new BadRequestException(
          'Tên đăng nhập này đã tồn tại trong hệ thống',
        );
      }
      throw error;
    }
  }

  async getStudentsByClassId(
    classId: string,
  ): Promise<StudentAccountSummary[]> {
    this.validateObjectId(classId);

    const enrollments = (await this.classEnrollmentModel
      .find({
        class_id: new Types.ObjectId(classId),
      })
      .populate(
        'student_id',
        'fullname username avatar_url raw_password',
      )) as unknown as EnrollmentWithStudent[];

    return enrollments.map((enrollment) => ({
      id: String(enrollment.student_id._id),
      fullname: enrollment.student_id.fullname,
      username: enrollment.student_id.username || '',
      avatar_url: enrollment.student_id.avatar_url || '',
      password: enrollment.student_id.raw_password,
    }));
  }

  async getStudentsByTeacherId(
    teacherId: string,
  ): Promise<StudentAccountSummary[]> {
    this.validateObjectId(teacherId);

    const profiles = (await this.studentProfileModel
      .find({
        teacher_id: new Types.ObjectId(teacherId),
      })
      .populate(
        'user_id',
        'fullname username avatar_url raw_password',
      )) as unknown as StudentProfileWithUser[];

    return profiles.map((profile) => ({
      id: String(profile.user_id._id),
      fullname: profile.user_id.fullname,
      username: profile.user_id.username || '',
      avatar_url: profile.user_id.avatar_url || '',
      password: profile.user_id.raw_password,
    }));
  }

  private async findProfileUser(
    userId: Types.ObjectId,
  ): Promise<UsersDocument> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return user;
  }

  private buildUserResponse(user: UsersDocument): ProfileUserResponseDto {
    return {
      id: String(user._id),
      fullname: user.fullname,
      email: user.email || '',
      avatar_url: user.avatar_url,
      phone: user.phone,
      role: user.role,
      status: user.status,
    };
  }
}

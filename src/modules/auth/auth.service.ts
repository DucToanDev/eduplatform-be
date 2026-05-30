import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { TeacherProfile } from '../users/schemas/teacher-profile.schema';
import { UserRole, Users } from '../users/schemas/users.schema';
import { AuthTokenResponseDto } from './dto/auth-token-response.dto';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users.name)
    private readonly userModel: Model<Users>,
    @InjectModel(TeacherProfile.name)
    private readonly teacherProfileModel: Model<TeacherProfile>,
    private readonly jwtService: JwtService,
  ) {}

  private buildAuthResponse(
    message: string,
    user: Users & { _id: unknown },
  ): AuthTokenResponseDto {
    const accessToken = this.jwtService.sign({ id: user._id });

    return {
      message,
      data: {
        accessToken,
        user: {
          id: String(user._id),
          fullname: user.fullname,
          email: user.email,
          avatar_url: user.avatar_url,
          role: user.role,
          status: user.status,
        },
      },
    };
  }

  async signUp(signUpDTO: SignUpDto): Promise<AuthTokenResponseDto> {
    const { fullname, email, password } = signUpDTO;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await this.userModel.create({
        fullname,
        email,
        password: hashedPassword,
        role: UserRole.TEACHER,
      });

      await this.teacherProfileModel.create({
        user_id: user._id,
      });

      return this.buildAuthResponse(
        'Đăng ký tài khoản giáo viên thành công',
        user,
      );
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('Email đã được sử dụng');
      }

      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthTokenResponseDto> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không hợp lệ');
    }

    if (!user.status) {
      throw new ForbiddenException('Tài khoản đã bị khóa');
    }

    const isPasswordMatches = await bcrypt.compare(password, user.password);
    if (!isPasswordMatches) {
      throw new UnauthorizedException('Email hoặc mật khẩu không hợp lệ');
    }

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { last_login_at: new Date() } },
    );

    return this.buildAuthResponse('Đăng nhập thành công', user);
  }
}

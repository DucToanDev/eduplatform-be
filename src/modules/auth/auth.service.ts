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
import { RefreshToken } from './schemas/refresh-tokens.schema';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { TeacherSubscriptionsService } from '../teacher-subscriptions/teacher-subscriptions.service';

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
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly teacherSubsService: TeacherSubscriptionsService,
  ) {}

  private async buildAuthResponse(
    message: string,
    user: Users & { _id: any },
  ): Promise<{ response: AuthTokenResponseDto; refreshToken: string }> {
    const accessToken = this.jwtService.sign({ id: user._id, role: user.role });
    const refreshToken = uuidv4();
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days TTL

    await this.refreshTokenModel.create({
      user_id: user._id,
      token: hashedToken,
      expires_at: expiresAt,
    });

    const response = {
      message,
      data: {
        accessToken,
        user: {
          id: String(user._id),
          fullname: user.fullname,
          email: user.email || '',
          username: user.username || '',
          avatar_url: user.avatar_url,
          role: user.role,
          status: user.status,
        },
      },
    };

    return { response, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken)
      throw new UnauthorizedException('Không tìm thấy Refresh Token');

    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    const tokenDoc = await this.refreshTokenModel
      .findOne({ token: hashedToken })
      .exec();

    if (!tokenDoc) {
      throw new UnauthorizedException(
        'Refresh Token không hợp lệ hoặc đã hết hạn',
      );
    }

    const user = await this.userModel.findById(tokenDoc.user_id).exec();
    if (!user || !user.status) {
      throw new UnauthorizedException(
        'Tài khoản đã bị khóa hoặc không tồn tại',
      );
    }

    // Xóa token cũ (Rotation)
    await this.refreshTokenModel.deleteOne({ _id: tokenDoc._id }).exec();

    // Tạo cặp token mới
    return this.buildAuthResponse('Làm mới token thành công', user);
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    await this.refreshTokenModel.deleteOne({ token: hashedToken }).exec();
  }

  async signUp(
    signUpDTO: SignUpDto,
  ): Promise<{ response: AuthTokenResponseDto; refreshToken: string }> {
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

      await this.teacherSubsService.activateBasicSubscription(
        user._id.toString(),
      );

      return await this.buildAuthResponse(
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

  async login(
    loginDto: LoginDto,
  ): Promise<{ response: AuthTokenResponseDto; refreshToken: string }> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (!user.status) {
      throw new ForbiddenException('Tài khoản đã bị khóa');
    }

    if (user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Bạn không có quyền truy cập cổng này !');
    }

    const isPasswordMatches = await bcrypt.compare(password, user.password);
    if (!isPasswordMatches) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng !');
    }

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { last_login_at: new Date() } },
    );

    return await this.buildAuthResponse('Đăng nhập thành công', user);
  }

  async adminLogin(
    loginDto: LoginDto,
  ): Promise<{ response: AuthTokenResponseDto; refreshToken: string }> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (!user.status) {
      throw new ForbiddenException('Tài khoản đã bị khóa');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập cổng Quản trị viên !',
      );
    }

    const isPasswordMatches = await bcrypt.compare(password, user.password);
    if (!isPasswordMatches) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng !');
    }

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { last_login_at: new Date() } },
    );

    return await this.buildAuthResponse('Đăng nhập Admin thành công', user);
  }

  async studentLogin(
    loginDto: any,
  ): Promise<{ response: AuthTokenResponseDto; refreshToken: string }> {
    const { username, password } = loginDto;
    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new UnauthorizedException(
        'Tên đăng nhập hoặc mật khẩu không đúng !',
      );
    }

    if (!user.status) {
      throw new ForbiddenException('Tài khoản đã bị khóa');
    }

    if (user.role !== UserRole.STUDENT) {
      throw new ForbiddenException(
        'Chỉ học sinh mới được phép đăng nhập qua API này',
      );
    }

    const isPasswordMatches = await bcrypt.compare(password, user.password);
    if (!isPasswordMatches) {
      throw new UnauthorizedException(
        'Tên đăng nhập hoặc mật khẩu không đúng !',
      );
    }

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { last_login_at: new Date() } },
    );

    return await this.buildAuthResponse('Đăng nhập thành công', user);
  }
}

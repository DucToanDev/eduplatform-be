import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request, CookieOptions } from 'express';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBody,
} from '@nestjs/swagger';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { StudentLoginDto } from './dto/student-login.dto';
import { AuthTokenResponseDto } from './dto/auth-token-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    if (accessToken) {
      // Access token expiration: 30 minutes
      res.cookie('access_token', accessToken, {
        ...cookieOptions,
        maxAge: 30 * 60 * 1000,
      });
    }
    if (refreshToken) {
      // Refresh token expiration: 7 days
      res.cookie('refresh_token', refreshToken, cookieOptions);
    }
  }

  @Post('/signup')
  @ApiOperation({ summary: 'Đăng ký tài khoản giáo viên' })
  @ApiCreatedResponse({
    description: 'Đăng ký tài khoản giáo viên thành công, trả về JWT token',
    type: AuthTokenResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu gửi lên không hợp lệ' })
  @ApiConflictResponse({ description: 'Email đã được sử dụng' })
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokenResponseDto> {
    const { response, refreshToken } = await this.authService.signUp(signUpDto);
    this.setCookies(res, response.data.accessToken, refreshToken);
    return response;
  }

  @Post('/teacher/login')
  @ApiOperation({ summary: 'Đăng nhập dành riêng cho giáo viên' })
  @ApiOkResponse({
    description: 'Đăng nhập thành công, trả về JWT token',
    type: AuthTokenResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu gửi lên không hợp lệ' })
  @ApiForbiddenResponse({ description: 'Tài khoản đã bị khóa' })
  @ApiUnauthorizedResponse({ description: 'Email hoặc mật khẩu không đúng !' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokenResponseDto> {
    const { response, refreshToken } = await this.authService.login(loginDto);
    this.setCookies(res, response.data.accessToken, refreshToken);
    return response;
  }

  @Post('/admin/login')
  @ApiOperation({ summary: 'Đăng nhập dành riêng cho Quản trị viên (Admin)' })
  @ApiOkResponse({
    description: 'Đăng nhập thành công, trả về JWT token',
    type: AuthTokenResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu gửi lên không hợp lệ' })
  @ApiForbiddenResponse({
    description: 'Tài khoản đã bị khóa hoặc không đủ quyền',
  })
  @ApiUnauthorizedResponse({ description: 'Email hoặc mật khẩu không đúng !' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'admin@eduplatform.com' },
        password: { type: 'string', example: 'admin123' },
      },
    },
  })
  async adminLogin(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokenResponseDto> {
    const { response, refreshToken } =
      await this.authService.adminLogin(loginDto);
    this.setCookies(res, response.data.accessToken, refreshToken);
    return response;
  }

  @Post('/student/login')
  @ApiOperation({ summary: 'Đăng nhập dành riêng cho học sinh' })
  @ApiOkResponse({
    description: 'Đăng nhập thành công, trả về JWT token',
    type: AuthTokenResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu gửi lên không hợp lệ' })
  @ApiForbiddenResponse({ description: 'Tài khoản đã bị khóa' })
  @ApiUnauthorizedResponse({
    description: 'Tên đăng nhập hoặc mật khẩu không đúng !',
  })
  async studentLogin(
    @Body() loginDto: StudentLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokenResponseDto> {
    const { response, refreshToken } =
      await this.authService.studentLogin(loginDto);
    this.setCookies(res, response.data.accessToken, refreshToken);
    return response;
  }

  @Post('/refresh')
  @ApiOperation({
    summary: 'Làm mới Access Token bằng Refresh Token (Lấy từ Cookie)',
  })
  @ApiOkResponse({
    description: 'Cấp mới token thành công',
    type: AuthTokenResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh Token không hợp lệ hoặc đã hết hạn',
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokenResponseDto> {
    const oldRefreshToken = req.cookies?.refresh_token;
    if (!oldRefreshToken) {
      throw new UnauthorizedException(
        'Không tìm thấy Refresh Token trong cookie. Vui lòng đăng nhập lại.',
      );
    }
    const { response, refreshToken } =
      await this.authService.refreshTokens(oldRefreshToken);
    this.setCookies(res, response.data.accessToken, refreshToken);
    return response;
  }

  @Post('/logout')
  @ApiOperation({ summary: 'Đăng xuất, xóa Cookie và Refresh Token' })
  @ApiOkResponse({ description: 'Đăng xuất thành công' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const oldRefreshToken = req.cookies?.refresh_token;
    if (oldRefreshToken) {
      await this.authService.logout(oldRefreshToken);
    }
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Đăng xuất thành công', data: null };
  }
}

import { AuthService } from './auth.service';
import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthTokenResponseDto } from './dto/auth-token-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiCreatedResponse({
    description: 'Đăng ký thành công, trả về JWT token',
    type: AuthTokenResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu gửi lên không hợp lệ' })
  @ApiConflictResponse({ description: 'Email đã được sử dụng' })
  signUp(@Body() signUpDto: SignUpDto): Promise<AuthTokenResponseDto> {
    return this.authService.signUp(signUpDto);
  }

  @Post('/login')
  @ApiOperation({ summary: 'Đăng nhập bằng email và mật khẩu' })
  @ApiOkResponse({
    description: 'Đăng nhập thành công, trả về JWT token',
    type: AuthTokenResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu gửi lên không hợp lệ' })
  @ApiForbiddenResponse({ description: 'Tài khoản đã bị khóa' })
  @ApiUnauthorizedResponse({ description: 'Email hoặc mật khẩu không hợp lệ' })
  login(@Body() loginDto: LoginDto): Promise<AuthTokenResponseDto> {
    return this.authService.login(loginDto);
  }
}

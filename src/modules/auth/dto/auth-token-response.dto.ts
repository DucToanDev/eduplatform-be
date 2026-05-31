import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/schemas/users.schema';

export class AuthUserResponseDto {
  @ApiProperty({ example: '6659f9f7c1e9e7f0c4f0d1111' })
  readonly id: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  readonly fullname: string;

  @ApiProperty({ example: 'teacher@example.com', required: false })
  readonly email?: string;

  @ApiProperty({ example: 'hocsinh1', required: false })
  readonly username?: string;

  @ApiProperty({
    example:
      'https://ui-avatars.com/api/?name=teacher&background=f97316&color=ffffff&size=128',
  })
  readonly avatar_url: string;

  @ApiProperty({ enum: UserRole, example: UserRole.TEACHER })
  readonly role: UserRole;

  @ApiProperty({ example: true })
  readonly status: boolean;
}

export class AuthDataResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ij6659f9f7c1e9e7f0c4f0d1111.iat',
    description: 'JWT token dùng để xác thực các request tiếp theo',
  })
  readonly accessToken: string;

  @ApiProperty({ type: AuthUserResponseDto })
  readonly user: AuthUserResponseDto;
}

export class AuthTokenResponseDto {
  @ApiProperty({ example: 'Đăng nhập thành công' })
  readonly message: string;

  @ApiProperty({ type: AuthDataResponseDto })
  readonly data: AuthDataResponseDto;
}

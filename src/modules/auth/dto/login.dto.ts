import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'teacher@example.com',
    description: 'Email đã đăng ký',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsNotEmpty()
  @IsEmail({}, { message: 'Vui lòng nhập đúng định dạng email' })
  readonly email: string;

  @ApiProperty({
    example: 'password123',
    minLength: 8,
    description: 'Mật khẩu của tài khoản',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly password: string;
}

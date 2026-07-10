import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@edu.com',
    description: 'Email đã đăng ký (VD: admin@edu.com, gv1@edu.com)',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsNotEmpty()
  @IsEmail({}, { message: 'Vui lòng nhập đúng định dạng email' })
  readonly email: string;

  @ApiProperty({
    example: '123',
    description: 'Mật khẩu của tài khoản',
  })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}

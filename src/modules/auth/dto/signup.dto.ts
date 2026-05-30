import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    example: 'Nguyen Van A',
    description: 'Họ tên đầy đủ của người dùng',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @IsString()
  readonly fullname: string;

  @ApiProperty({
    example: 'teacher@example.com',
    description: 'Email đăng nhập, không được trùng với user khác',
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
    description: 'Mật khẩu tối thiểu 8 ký tự',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly password: string;
}

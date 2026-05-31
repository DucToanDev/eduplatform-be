import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class StudentLoginDto {
  @ApiProperty({
    example: 'hocsinh1',
    description: 'Tên đăng nhập',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @ApiProperty({
    example: '123123',
    description: 'Mật khẩu của tài khoản',
  })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}

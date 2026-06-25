import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  current_password: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  new_password: string;
}

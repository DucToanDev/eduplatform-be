import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    example: '60c72b2f9b1d8b001c8e4b5a',
    description: 'ID của người dùng nhận thông báo',
  })
  @IsMongoId()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    example: 'Bạn có một bài học mới cần hoàn thành',
    description: 'Nội dung thông báo',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

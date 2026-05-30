import { ApiProperty } from '@nestjs/swagger';

export class AvatarResponseDto {
  @ApiProperty({ example: 'Cập nhật avatar thành công' })
  readonly message: string;

  @ApiProperty({
    example:
      'https://res.cloudinary.com/demo/image/upload/v1710000000/edu-platform/avatars/avatar.jpg',
  })
  readonly avatar_url: string;
}

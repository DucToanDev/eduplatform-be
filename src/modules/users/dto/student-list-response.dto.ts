import { ApiProperty } from '@nestjs/swagger';

export class StudentListResponseDto {
  @ApiProperty({ example: '6659f9f7c1e9e7f0c4f0d1111' })
  readonly id: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  readonly fullname: string;

  @ApiProperty({ example: 'hocsinh1' })
  readonly username: string;

  @ApiProperty({
    example:
      'https://ui-avatars.com/api/?name=hocsinh1&background=f97316&color=ffffff&size=128',
  })
  readonly avatar_url: string;

  @ApiProperty({ example: '123456' })
  readonly password?: string;

  @ApiProperty({ example: 'PHHS1234', required: false })
  readonly parent_access_codes?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../schemas/users.schema';

export class ProfileUserResponseDto {
  @ApiProperty({ example: '6659f9f7c1e9e7f0c4f0d1111' })
  readonly id: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  readonly fullname: string;

  @ApiProperty({ example: 'teacher@example.com' })
  readonly email: string;

  @ApiProperty({
    example:
      'https://res.cloudinary.com/demo/image/upload/v1710000000/edu-platform/avatars/avatar.jpg',
  })
  readonly avatar_url: string;

  @ApiPropertyOptional({ example: '0901234567' })
  readonly phone?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.TEACHER })
  readonly role: UserRole;

  @ApiProperty({ example: true })
  readonly status: boolean;
}

export class TeacherProfileDataDto {
  @ApiPropertyOptional({ example: 'Math teacher with 5 years of experience' })
  readonly bio?: string;

  @ApiPropertyOptional({ example: 'Mathematics, Algebra, Geometry' })
  readonly expertise?: string;

  @ApiPropertyOptional({ example: 5 })
  readonly experience_years?: number;
}

export class TeacherProfileResponseDto {
  @ApiProperty({ example: '665a0a0d6ac543119e575bed' })
  readonly id: string;

  @ApiProperty({ type: ProfileUserResponseDto })
  readonly user: ProfileUserResponseDto;

  @ApiProperty({ type: TeacherProfileDataDto })
  readonly profile: TeacherProfileDataDto;
}

export class StudentProfileDataDto {
  @ApiPropertyOptional({ example: '2012-05-20T00:00:00.000Z' })
  readonly date_of_birth?: Date;

  @ApiPropertyOptional({ example: 'Grade 6' })
  readonly grade_level?: string;

  @ApiPropertyOptional({ example: '0901234567' })
  readonly parent_phone?: string;

  @ApiProperty({ example: 100 })
  readonly points: number;
}

export class StudentProfileResponseDto {
  @ApiProperty({ example: '665a0a0d6ac543119e575bed' })
  readonly id: string;

  @ApiProperty({ type: ProfileUserResponseDto })
  readonly user: ProfileUserResponseDto;

  @ApiProperty({ type: StudentProfileDataDto })
  readonly profile: StudentProfileDataDto;
}

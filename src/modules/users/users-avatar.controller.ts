import {
  Controller,
  Param,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedUser, JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AvatarResponseDto } from './dto/avatar-response.dto';
import { UsersService } from './users.service';

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersAvatarController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Cập nhật avatar người dùng' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['avatar'],
    },
  })
  @ApiOkResponse({
    description: 'Cập nhật avatar thành công',
    type: AvatarResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Id hoặc file upload không hợp lệ' })
  @ApiForbiddenResponse({ description: 'Không có quyền cập nhật avatar này' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy người dùng' })
  updateAvatar(
    @Param('id') id: string,
    @UploadedFile() avatar: Express.Multer.File,
    @Req() request: AuthenticatedRequest,
  ): Promise<AvatarResponseDto> {
    return this.usersService.updateAvatar(id, avatar, request.user.userId);
  }
}

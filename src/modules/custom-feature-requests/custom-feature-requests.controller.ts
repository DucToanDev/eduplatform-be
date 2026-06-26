import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthenticatedUser, JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/users.schema';
import { CreateCustomFeatureRequestDto } from './dto/create-custom-feature-request.dto';
import { CustomFeatureRequestQueryDto } from './dto/custom-feature-request-query.dto';
import { UpdateCustomFeatureRequestStatusDto } from './dto/update-custom-feature-request-status.dto';
import { CustomFeatureRequestsService } from './custom-feature-requests.service';

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@ApiTags('Custom Feature Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('custom-feature-requests')
export class CustomFeatureRequestsController {
  constructor(private readonly requestsService: CustomFeatureRequestsService) {}

  @Post()
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'User gửi yêu cầu custom feature' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCustomFeatureRequestDto,
  ) {
    return this.requestsService.create(req.user.id, dto);
  }

  @Get('admin')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Admin/manager xem danh sách yêu cầu custom feature',
  })
  findAll(@Query() query: CustomFeatureRequestQueryDto) {
    return this.requestsService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.TEACHER)
  @ApiOperation({ summary: 'Xem chi tiết yêu cầu custom feature' })
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.requestsService.findOne(id, req.user);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Cập nhật trạng thái yêu cầu custom feature' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCustomFeatureRequestStatusDto,
  ) {
    return this.requestsService.updateStatus(id, dto);
  }
}

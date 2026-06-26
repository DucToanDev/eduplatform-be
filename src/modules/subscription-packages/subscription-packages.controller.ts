import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/users.schema';
import { CreateSubscriptionPackageDto } from './dto/create-subscription-package.dto';
import { UpdateSubscriptionPackageDto } from './dto/update-subscription-package.dto';
import { SubscriptionPackagesService } from './subscription-packages.service';

@ApiTags('Subscription Packages')
@Controller('subscription-packages')
export class SubscriptionPackagesController {
  constructor(
    private readonly subscriptionPackagesService: SubscriptionPackagesService,
  ) {}

  @Get('active')
  @ApiOperation({ summary: 'Lấy danh sách các gói thuê bao đang hoạt động' })
  async getActivePackages() {
    return this.subscriptionPackagesService.findActivePackages();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Tạo gói thuê bao mới (Admin/Manager)' })
  async createPackage(@Body() createDto: CreateSubscriptionPackageDto) {
    return this.subscriptionPackagesService.createPackage(createDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Cập nhật thông tin gói thuê bao (Admin/Manager)' })
  async updatePackage(
    @Param('id') id: string,
    @Body() updateDto: UpdateSubscriptionPackageDto,
  ) {
    return this.subscriptionPackagesService.updatePackage(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Vô hiệu hóa (soft-delete) gói thuê bao (Admin/Manager)',
  })
  async disablePackage(@Param('id') id: string) {
    return this.subscriptionPackagesService.disablePackage(id);
  }
}

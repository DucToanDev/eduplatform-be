import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthenticatedUser, JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/users.schema';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { TransactionsService } from './transactions.service';

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Admin/manager xem danh sách giao dịch' })
  findAll(@Query() query: TransactionQueryDto) {
    return this.transactionsService.findAll(query);
  }

  @Get('teacher/me')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Giáo viên xem giao dịch liên quan' })
  findTeacherTransactions(
    @Req() req: AuthenticatedRequest,
    @Query() query: PaginationQueryDto,
  ) {
    return this.transactionsService.findForTeacher(req.user.id, query);
  }
}

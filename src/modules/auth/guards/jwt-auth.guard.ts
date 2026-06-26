import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserRole } from '../../users/schemas/users.schema';

export type AuthenticatedUser = {
  id: string;
  role: UserRole;
  exp?: number;
};

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Vui lòng đăng nhập');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        id: string;
        role: UserRole;
        exp: number;
      }>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      request.user = { id: payload.id, role: payload.role, exp: payload.exp };
      return true;
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  private extractToken(request: Request): string | undefined {
    const cookieToken = request.cookies?.access_token as unknown;
    if (typeof cookieToken === 'string') {
      return cookieToken;
    }

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

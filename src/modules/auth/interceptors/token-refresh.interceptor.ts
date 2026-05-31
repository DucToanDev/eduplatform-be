import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenRefreshInterceptor implements NestInterceptor {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    if (request.user && request.user.exp) {
      const now = Math.floor(Date.now() / 1000);
      const expirationTime = request.user.exp;
      const timeLeft = expirationTime - now;

      // Mỗi khi nhận một API response thành công, nó sẽ ngó xem trong Header
      // có biến X-New-Token không. Nếu có, Frontend phải tự động lấy token đó
      // lưu đè vào LocalStorage/Cookie để dùng cho các request tiếp theo

      // Ngưỡng cấp lại token mới: Nếu thời gian sống còn lại <= 15 phút (900 giây)
      if (timeLeft > 0 && timeLeft <= 900) {
        const payload = {
          id: request.user.id || request.user.userId,
          role: request.user.role,
        };

        const expiresIn =
          this.configService.get<string>('JWT_EXPIRES_IN') ?? '30m';

        // tạo mới
        const newToken = this.jwtService.sign(payload, {
          expiresIn: expiresIn as any,
        });

        // quăng về cho FE
        response.setHeader('X-New-Token', newToken);
        // cấp quyền cho FE đọc
        response.setHeader('Access-Control-Expose-Headers', 'X-New-Token');
      }
    }

    return next.handle().pipe(
      tap(() => {
        // We do nothing after the response is sent, header is already set
      }),
    );
  }
}

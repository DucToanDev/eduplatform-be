import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorLogsService } from '../../modules/error-logs/error-logs.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly errorLogsService: ErrorLogsService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Lỗi hệ thống nội bộ. Vui lòng thử lại sau.';
    let errorType = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();

      // Nếu exception từ ValidationPipe hoặc có cấu trúc chuẩn thì lấy message của nó
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = exceptionResponse.message || exception.message;
        errorType = exceptionResponse.error || exception.name;
      } else {
        message = exception.message;
        errorType = exception.name;
      }
    } else {
      // Log lỗi hệ thống ra console để dev xem, KHÔNG lộ ra ngoài
      console.error(
        `[UnhandledException] ${request.method} ${request.url}`,
        exception,
      );
    }

    // Fire and forget logging
    this.errorLogsService.logError({
      statusCode: status,
      method: request.method,
      path: request.url,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      details: exception instanceof Error ? exception.stack : exception,
      user_id: (request as any).user?.userId,
    });

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
      error: errorType,
    });
  }
}

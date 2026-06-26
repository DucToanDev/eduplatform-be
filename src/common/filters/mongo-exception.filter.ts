import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { MongoServerError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';
import { ErrorLogsService } from '../../modules/error-logs/error-logs.service';

@Catch(MongoServerError, MongooseError.CastError, MongooseError.ValidationError)
export class MongoExceptionFilter implements ExceptionFilter {
  constructor(private readonly errorLogsService: ErrorLogsService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Lỗi hệ thống cơ sở dữ liệu';

    // Xử lý lỗi trùng lặp dữ liệu (Duplicate Key)
    if (exception instanceof MongoServerError && exception.code === 11000) {
      status = HttpStatus.CONFLICT; // 409
      const field = Object.keys(exception.keyValue)[0];
      message = `Trường dữ liệu '${field}' đã tồn tại trong hệ thống. Vui lòng sử dụng giá trị khác.`;
    }
    // Xử lý lỗi sai định dạng ID (CastError)
    else if (exception.name === 'CastError') {
      status = HttpStatus.BAD_REQUEST; // 400
      message = `Định dạng dữ liệu không hợp lệ tại trường '${exception.path}' (Giá trị nhận được: ${exception.value})`;
    }
    // Xử lý lỗi Validate của Mongoose
    else if (exception.name === 'ValidationError') {
      status = HttpStatus.BAD_REQUEST; // 400
      message = 'Dữ liệu không đáp ứng các ràng buộc của cơ sở dữ liệu';
    }

    // Fire and forget logging
    this.errorLogsService.logError({
      statusCode: status,
      method: request.method,
      path: request.url,
      message: message,
      details: exception.stack,
      user_id: (request as any).user?.userId,
    });

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
      error: HttpStatus[status],
    });
  }
}

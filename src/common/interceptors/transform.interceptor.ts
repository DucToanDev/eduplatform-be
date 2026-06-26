import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        // Handle cases where the service already returns a structured object like { message: '...', data: ... }
        if (
          data &&
          typeof data === 'object' &&
          ('data' in data || 'message' in data)
        ) {
          return {
            statusCode,
            message: data.message || 'Success',
            data: data.data !== undefined ? data.data : data,
          };
        }

        // Default case: wrap the data
        return {
          statusCode,
          message: 'Success',
          data: data,
        };
      }),
    );
  }
}

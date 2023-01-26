import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ResDefault } from '../types/response';

export interface Response<T> {
  message?: Array<string>;
  error?: string;
  data?: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<ResDefault>,
  ): Observable<Response<T>> {
    // 요청 전 커스텀 로직 작성 가능

    // 응답 전 커스텀 로직 작성 가능
    return next.handle().pipe(
      // 응답을 추가로 조작
      map((data) => {
        context.switchToHttp().getResponse().status(data.statusCode);
        return {
          statusCode: data.statusCode,
          data: data.data,
          error: data.error,
          message: data.message,
        };
      }),
    );
  }
}

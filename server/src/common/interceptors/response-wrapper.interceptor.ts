import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface WrappedResponse<T> {
  data: T
  message: string
  timestamp: string
}

@Injectable()
export class ResponseWrapperInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<WrappedResponse<unknown>> {
    return next.handle().pipe(
      map((data) => ({
        data,
        message: 'OK',
        timestamp: new Date().toISOString(),
      })),
    )
  }
}

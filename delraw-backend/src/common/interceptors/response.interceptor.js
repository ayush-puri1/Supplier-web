import { Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

/**
 * Interceptor that wraps all successful responses in a standard structure:
 * { success: true, data: ... }
 * This helps the frontend maintain a consistent way of consuming API responses.
 */
@Injectable()
export class ResponseInterceptor {
  /**
   * @param {import('@nestjs/common').ExecutionContext} context
   * @param {import('@nestjs/common').CallHandler} next
   * @returns {import('rxjs').Observable<any>}
   */
  intercept(context, next) {
    return next.handle().pipe(map((data) => ({ success: true, data })));
  }
}

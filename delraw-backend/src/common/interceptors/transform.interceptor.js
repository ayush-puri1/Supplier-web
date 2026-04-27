import { Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

/**
 * A more advanced interceptor that can handle nested data and custom messages.
 * Useful for normalizing varied response shapes from different services into a
 * standard { success, data, message } format.
 */
@Injectable()
export class TransformInterceptor {
  /**
   * @param {import('@nestjs/common').ExecutionContext} context - Provides details about the current request.
   * @param {import('@nestjs/common').CallHandler} next - The next handler in the execution chain.
   */
  intercept(context, next) {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: data?.data || data,
        message: data?.message || undefined,
      })),
    );
  }
}

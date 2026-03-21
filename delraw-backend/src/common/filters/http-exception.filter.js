import { Catch, HttpException, HttpStatus } from '@nestjs/common';

/**
 * Filter to handle HTTP exceptions specifically.
 * It formats the error message and generates a consistent error code.
 */
@Catch()
export class HttpExceptionFilter {
  /**
   * @param {any} exception
   * @param {import('@nestjs/common').ArgumentsHost} host
   */
  catch(exception, host) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? (exception.getResponse()).message || exception.message
      : 'Internal server error';

    response.status(status).json({
      success: false,
      message: Array.isArray(message) ? message[0] : message,
      errorCode: exception instanceof HttpException 
        ? exception.message.toUpperCase().replace(/ /g, '_') 
        : 'INTERNAL_ERROR'
    });
  }
}

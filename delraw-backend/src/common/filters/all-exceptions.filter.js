import { Catch, HttpException, HttpStatus } from '@nestjs/common';

/**
 * Global exception filter to catch all unhandled exceptions and format the response.
 * This ensures that every error returned by the API follows a consistent structure.
 */
@Catch()
export class AllExceptionsFilter {
  /**
   * Method to catch and handle the exception.
   * @param {any} exception - The exception being caught.
   * @param {import('@nestjs/common').ArgumentsHost} host - Context for the current request.
   */
  catch(exception, host) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse().message || exception.message
        : 'Internal server error';

    const errorCode =
      exception instanceof HttpException
        ? exception.getResponse().errorCode || undefined
        : undefined;

    response.status(status).json({
      success: false,
      error: message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('wallet-app');
  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse() as {
        message: string[] | string;
      };
      return response.status(status).json({
        success: false,
        message: Array.isArray(errorResponse.message)
          ? errorResponse.message[0]
          : errorResponse.message,
        errors: Array.isArray(errorResponse.message)
          ? errorResponse.message
          : undefined
      });
    }

    // const errorMessage = 'Something went wrong. Please try again later';
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Something went wrong. Please try again later'
    });
  }
}

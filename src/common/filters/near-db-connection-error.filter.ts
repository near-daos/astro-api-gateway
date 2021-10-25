import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class NearDBConnectionErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(NearDBConnectionErrorFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    this.logger.error(exception, exception.stack);

    const { message } = exception;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}

import {
  ArgumentsHost,
  Catch,
  HttpException,
  ExceptionFilter,
} from '@nestjs/common';
import { Request, Response } from 'express';

// Custorm Http exception filter
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();
    const request: Request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message;

    response.status(status).json({
      code: status,
      timestamp: new Date().toISOString(),
      message,
      path: request.url,
    });
  }
}

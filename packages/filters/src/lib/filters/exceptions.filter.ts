import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Response, Request } from 'express';
import { getCode, getErrorMessage } from '../utils/error.utils';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const request: Request = ctx.getRequest<Request>();
    const response: Response = ctx.getResponse<Response>();

    const status: number = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR; // 500
    const code: string =
      getCode(HttpStatus[status]) || HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR]; // INTERNAL_SERVER_ERROR
    const message: string = getErrorMessage(exception.getResponse());
    const exceptionStack: string = 'stack' in exception ? exception.stack : '';

    response.status(status).json({
      meta: {
        url: request.url,
        method: request.method,
        status,
      },
      data: null,
      errors: [
        {
          status,
          code,
          message,
          path: exceptionStack,
        },
      ],
    });
  }
}

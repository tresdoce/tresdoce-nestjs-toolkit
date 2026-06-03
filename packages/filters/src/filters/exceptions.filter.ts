import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Typings, excludePaths } from '@tresdoce-nestjs-toolkit/core';

import { buildErrorPayload } from './utils/error.utils';
import { PROBLEM_CONTENT_TYPE } from './constants/filters.constants';

@Injectable()
@Catch()
export class ExceptionsFilter<T> implements ExceptionFilter {
  constructor(private readonly appConfig: Typings.AppConfig) {}

  catch(_exception: T, _host: ArgumentsHost): void {
    const excludePathsList = excludePaths();
    const ctx = _host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const apiPrefix: string = this.appConfig?.project.apiPrefix || 'API-PREFIX';

    if (excludePathsList.includes(request.url)) {
      if (_exception instanceof HttpException) {
        response.status(_exception.getStatus()).json(_exception.getResponse());
      } else {
        response
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Internal server error' });
      }
      return;
    }

    const { error } = buildErrorPayload(apiPrefix, request.method, request.url, _exception);
    response.type(PROBLEM_CONTENT_TYPE).status(error.status).json({ error });
  }
}

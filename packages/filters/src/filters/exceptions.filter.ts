import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import _ from 'lodash';
import { Typings } from '@tresdoce-nestjs-toolkit/core';

import { getCode, getErrorMessage } from './utils/error.utils';
import { PROBLEM_CONTENT_TYPE } from './constants/filters.constants';

@Catch()
export class ExceptionsFilter<T> implements ExceptionFilter {
  constructor(private readonly appConfig: Typings.AppConfig) {}

  catch(_exception: T, _host: ArgumentsHost): void {
    const ctx = _host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const apiPrefix: string = this.appConfig?.project.apiPrefix || 'API-PREFIX';
    const instance = `${_.toUpper(request.method)} ${request.url}`;

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;

    let message;
    let detail;

    if (_exception instanceof HttpException) {
      status = _exception.getStatus();
      const exceptionResponse = getErrorMessage(_exception.getResponse(), HttpStatus[status]);
      message = exceptionResponse.message;
      detail = exceptionResponse.detail;
    } else {
      const error = _exception as any;
      message = error.message;
    }

    const errorInfo = {
      status,
      instance,
      code: `${apiPrefix}-${getCode(HttpStatus[status])}`,
      message,
      detail,
    };

    response.type(PROBLEM_CONTENT_TYPE).status(status).json({ error: errorInfo });
  }
}

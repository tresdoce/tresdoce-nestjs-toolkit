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
import _ from 'lodash';

import { getCode, getErrorMessage } from './utils/error.utils';
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
    const instance = `${_.toUpper(request.method)} ${request.url}`;

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;

    let message, detail;

    if (excludePathsList.includes(request.url)) {
      if (_exception instanceof HttpException) {
        response.status(_exception.getStatus()).json(_exception.getResponse());
      }
      return;
    }

    if (_exception instanceof HttpException) {
      status = _exception.getStatus();
      const exceptionResponse = getErrorMessage(_exception.getResponse(), HttpStatus[status]);
      message = exceptionResponse.message;
      detail = exceptionResponse.detail;
    } else {
      const error = _exception as any;
      message = error.message;
    }

    response
      .type(PROBLEM_CONTENT_TYPE)
      .status(status)
      .json({
        error: {
          status,
          instance,
          code: `${apiPrefix}-${getCode(HttpStatus[status])}`,
          message,
          detail,
        },
      });
  }
}

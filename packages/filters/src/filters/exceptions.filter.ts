import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Typings } from '@tresdoce-nestjs-toolkit/core';

import { getCode } from './utils/error.utils';
import { IExceptionResponse } from './types';
import { PROBLEM_CONTENT_TYPE } from './constants/filters.constants';

@Catch(HttpException)
export class ExceptionsFilter implements ExceptionFilter {
  constructor(private readonly appConfig: Typings.AppConfig) {}

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status: number = exception.getStatus();
    const errorResponse = exception.getResponse() as string | IExceptionResponse;
    let title: string;
    let detail;
    const type: string = this.appConfig?.project.homepage || 'https://example.com';
    const code: string = this.appConfig?.project.apiPrefix || 'API-PREFIX';
    let objectExtras = {};
    const instance: string | undefined = request.url;

    if (typeof errorResponse === 'string') {
      title = errorResponse;
    } else {
      title = errorResponse.message;
      if (typeof errorResponse.error === 'string') {
        detail = errorResponse.error;
      } else {
        if (errorResponse.error) {
          objectExtras = {
            ...errorResponse.error,
          };
        }
      }
    }

    const errorInfo = {
      ...objectExtras,
      type,
      title: title,
      status,
      code: `${code}-${getCode(HttpStatus[status])}`,
      detail,
      instance,
    };

    response
      .type(PROBLEM_CONTENT_TYPE)
      .status(status)
      .json({ errors: [errorInfo] });
  }
}

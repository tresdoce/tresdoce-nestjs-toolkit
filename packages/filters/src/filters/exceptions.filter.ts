import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { toUpper } from 'lodash';
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
    const apiPrefix: string = this.appConfig?.project.apiPrefix || 'API-PREFIX';
    const instance = `${toUpper(request.method)} ${request.url}`;

    let message;
    let detail;
    let objectExtras = {};
    //const stack: string = 'stack' in exception ? exception.stack : '';

    console.log('ERR: ', errorResponse);

    if (typeof errorResponse === 'string') {
      console.log('1: ', errorResponse);
      message = errorResponse;
    } else {
      if (errorResponse.message) {
        console.log('2: ', errorResponse.message);
        if (typeof errorResponse.message === 'string') {
          message = errorResponse.message;
          detail = errorResponse.detail;
        } else {
          message = errorResponse.error;
          detail = errorResponse.message;
        }
      } else {
        if (typeof errorResponse.error === 'string') {
          console.log('3: ', errorResponse.error);
          detail = errorResponse.error;
        } else {
          if (errorResponse.error) {
            console.log('4: ', errorResponse.error);
            objectExtras = {
              ...errorResponse.error,
            };
          }
        }
      }
    }

    const errorInfo = {
      status,
      instance,
      code: `${apiPrefix}-${getCode(HttpStatus[status])}`,
      message,
      detail,
      ...objectExtras,
    };

    /*
        {
          "error": {
            "code": 404,
            "status": "<API-PREFIX>-<HTTP-STATUS>",
            "message": "Request failed with status code 404",
            "instance": "GET /api/characters",
            "detail": [
              "firstName must be a string",
              "lastName must be a string",
              "email must be an email",
              "email must be a string"
            ]
          }
        }
        */

    response.type(PROBLEM_CONTENT_TYPE).status(status).json({ error: errorInfo });
  }
}

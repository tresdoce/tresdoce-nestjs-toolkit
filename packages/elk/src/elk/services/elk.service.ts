import { ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getCode, getErrorMessage } from '@tresdoce-nestjs-toolkit/filters';
import { ClientOptions, Client } from '@elastic/elasticsearch';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';

import { CONFIG_MODULE_OPTIONS } from '../constants/elk.constant';

@Injectable()
export class ElkService {
  private readonly client;

  constructor(
    private readonly configService: ConfigService,
    @Inject(CONFIG_MODULE_OPTIONS) private readonly options: ClientOptions,
  ) {
    this.client = new Client({
      ...options,
      generateRequestId: () => uuid(),
    });
  }

  public createElkDocument(
    _timeRequest: number,
    _context: ExecutionContext,
    _response: any,
    _isException = false,
  ): void {
    const requestDuration = Date.now() - _timeRequest;
    const controller = _context.getClass().name;
    const handler = _context.getHandler().name;
    const type = _context.getType();
    const ctx: HttpArgumentsHost = _context.switchToHttp();
    const req: Request = ctx.getRequest<Request>();
    const res: Response = ctx.getResponse<Response>();

    const query = _.isEmpty(req.query) ? null : JSON.stringify(req.query);
    const params = _.isEmpty(req.params) ? null : JSON.stringify(req.params);
    const body = _.isEmpty(req.body) ? null : JSON.stringify(req.body);
    const path = _.isEmpty(req.path) ? null : `${req.path}`;
    const url = _.isEmpty(req.url) ? null : `${req.url}`;
    const method = _.isEmpty(req.method) ? null : `${req.method}`;
    let statusCode: number = res.statusCode;
    let response = JSON.stringify(_response);

    if (_isException) {
      const responseException = this.responseException(req, _response);
      response = JSON.stringify(responseException);
      statusCode = responseException.error.status;
    }

    this.client.index({
      index: this.options.name,
      document: {
        application: `${process.env.npm_package_name}`,
        applicationVersion: `v${process.env.npm_package_version}`,
        path,
        url,
        controller,
        handler,
        type,
        method,
        query,
        params,
        body,
        timeRequest: _timeRequest,
        requestDuration,
        statusCode,
        response,
      },
    });
  }

  public responseException(_request, _exception) {
    const apiPrefix: string = this.configService.get('config.project.apiPrefix') || 'API-PREFIX';
    const instance = `${_.toUpper(_request.method)} ${_request.url}`;

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
    return {
      error: {
        status,
        instance,
        code: `${apiPrefix}-${getCode(HttpStatus[status])}`,
        message,
        detail,
      },
    };
  }
}

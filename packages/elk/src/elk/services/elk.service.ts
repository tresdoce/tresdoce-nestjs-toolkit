import { ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getCode, getErrorMessage } from '@tresdoce-nestjs-toolkit/filters';
import { ClientOptions } from '@elastic/elasticsearch';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';
import * as _ from 'lodash';

import { CONFIG_MODULE_OPTIONS, ELK_CLIENT } from '../constants/elk.constant';

@Injectable()
export class ElkService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CONFIG_MODULE_OPTIONS) private readonly options: ClientOptions,
    @Inject(ELK_CLIENT) private readonly elkClient,
  ) {}

  get clientRef() {
    return this.elkClient;
  }

  /*
   * Create index document
   */
  public async createIndexDocument(elkDocument: any): Promise<void> {
    await this.clientRef.index({
      index: this.options.name,
      body: elkDocument,
    });
  }

  /*
   * Serialize response interceptor
   */
  public async serializeResponseInterceptor(
    _timeRequest: number,
    _context: ExecutionContext,
    _response: any,
    _isException,
  ): Promise<void> {
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
    const path = `${req.path}`;
    const url = `${req.url}`;
    const method = `${req.method}`;
    let statusCode: number = res.statusCode;
    let response = JSON.stringify(_response);

    if (_isException) {
      const responseException = this.responseException(req, _response);
      response = JSON.stringify(responseException);
      statusCode = responseException.error.status;
    }

    const elkDocument = {
      application: `${this.configService.get('config.project.name')}`,
      applicationVersion: `v${this.configService.get('config.project.version')}`,
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
    };

    await this.createIndexDocument(elkDocument);
  }

  public responseException(_request, _exception) {
    const apiPrefix: string = this.configService.get('config.project.apiPrefix');
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

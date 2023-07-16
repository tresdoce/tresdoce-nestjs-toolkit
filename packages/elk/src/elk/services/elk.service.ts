import { ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { ConfigService } from '@nestjs/config';
import { getCode, getErrorMessage } from '@tresdoce-nestjs-toolkit/filters';
import { excludePaths } from '@tresdoce-nestjs-toolkit/core';
import { FormatService, RedactService } from '@tresdoce-nestjs-toolkit/utils';
import { Request, Response } from 'express';
import * as _ from 'lodash';

import { ELK_MODULE_OPTIONS, ELK_CLIENT } from '../constants/elk.constant';
import { ElasticsearchOptions } from '../interfaces/elk.interface';

@Injectable()
export class ElkService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(FormatService) private readonly formatService: FormatService,
    @Inject(RedactService) private readonly redactService: RedactService,
    @Inject(ELK_MODULE_OPTIONS) private readonly options: ElasticsearchOptions,
    @Inject(ELK_CLIENT) private readonly elkClient,
  ) {}

  get clientRef() {
    /* istanbul ignore next */
    return this.elkClient ? this.elkClient : null;
  }

  /*
   * Generate index name with date or not
   */
  private generateIndexDocument(_suffix?: string): string {
    /* istanbul ignore next */
    const { indexDate = true, name } = this.options;
    /* istanbul ignore next */
    const indexName: string = _suffix
      ? [`${name.toString()}`, _suffix].join('-')
      : `${name.toString()}`;
    const currentDate: string = this.formatService.formatDate({
      date: new Date(),
      formatDate: 'yyyy.LL.dd',
    });
    return indexDate ? `${indexName}-${currentDate}` : `${indexName}`;
  }

  /*
   * Create index document
   */
  public async createIndexDocument(elkDocument: any, _suffix?: string): Promise<void> {
    await this.clientRef?.index({
      index: this.generateIndexDocument(_suffix),
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
    const application = `${this.configService.get('config.project.name')}`;
    const applicationVersion = `v${this.configService.get('config.project.version')}`;
    const appStage = `${this.configService.get('config.server.appStage')}`;

    const requestDuration = this.formatService.calculateTimestampDiff({
      startTime: _timeRequest,
      endTime: Date.now(),
    });
    const controller = _context.getClass().name;
    const handler = _context.getHandler().name;
    const type = _context.getType();
    const ctx: HttpArgumentsHost = _context.switchToHttp();
    const req: Request = ctx.getRequest<Request>();
    const res: Response = ctx.getResponse<Response>();

    const cookies = req.cookies;
    const query = _.isEmpty(req.query) ? null : req.query;
    const params = _.isEmpty(req.params) ? null : req.params;
    const body = _.isEmpty(req.body) ? null : req.body;
    const headers = {
      request: req.headers,
      response: !_isException ? res.getHeaders() : {},
    };
    const path = `${req.path}`;
    const url = `${req.url}`;
    const method = `${req.method}`;
    let statusCode: number = res.statusCode;
    let response: any = _response;

    if (_.isUndefined(excludePaths().find((path) => _.startsWith(req.path, path)))) {
      if (_isException) {
        const responseException = this.responseException(req, _response);
        response = responseException;
        statusCode = responseException.error.status;
      }

      const tempDocument = {
        '@timestamp': this.formatService.dateToISO({ date: new Date(_timeRequest) }),
        application,
        applicationVersion,
        appStage,
        path,
        url,
        controller,
        handler,
        type,
        method,
        query,
        params,
        body,
        headers,
        cookies,
        requestDuration,
        statusCode,
        response,
      };

      const elkDocument = this.redactElkDocument(tempDocument);

      await this.createIndexDocument(elkDocument);
    }
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
      message = _exception.message;
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

  /* Redact ELK Document*/
  private redactElkDocument(_document) {
    const tempDocument = this.redactService.obfuscate(_document);

    tempDocument['query'] = JSON.stringify(tempDocument['query']);
    tempDocument['params'] = JSON.stringify(tempDocument['params']);
    tempDocument['body'] = JSON.stringify(tempDocument['body']);
    tempDocument['headers'] = JSON.stringify(tempDocument['headers']);
    tempDocument['cookies'] = JSON.stringify(tempDocument['cookies']);
    tempDocument['response'] = JSON.stringify(tempDocument['response']);

    return tempDocument;
  }
}

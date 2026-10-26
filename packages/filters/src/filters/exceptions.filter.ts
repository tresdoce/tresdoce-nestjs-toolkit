import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { type Typings, excludePaths } from '@tresdoce-nestjs-toolkit/core';

import { buildErrorPayload } from './utils/error.utils.js';
import { DEFAULT_API_PREFIX, PROBLEM_CONTENT_TYPE } from './constants/filters.constants.js';

@Injectable()
@Catch()
export class ExceptionsFilter<T = unknown> implements ExceptionFilter<T> {
  private readonly appConfig?: Typings.AppConfig;

  /**
   * @param appConfigOrConfigService - the centralized `Typings.AppConfig` (manual usage:
   * `app.useGlobalFilters(new ExceptionsFilter(appConfig))`) or a `ConfigService`, which is injected
   * automatically when the filter is registered through DI (`{ provide: APP_FILTER, useClass: ExceptionsFilter }`).
   */
  constructor(
    @Optional()
    @Inject(ConfigService)
    appConfigOrConfigService?: Typings.AppConfig | ConfigService,
  ) {
    this.appConfig =
      appConfigOrConfigService instanceof ConfigService
        ? appConfigOrConfigService.get<Typings.AppConfig>('config')
        : appConfigOrConfigService;
  }

  catch(_exception: T, _host: ArgumentsHost): void {
    const ctx = _host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // If the response was already (partially) sent there is nothing left to normalize.
    if (response.headersSent) {
      return;
    }

    const apiPrefix: string = this.appConfig?.project?.apiPrefix || DEFAULT_API_PREFIX;
    const url: string = request.url ?? '';
    const pathname = url.split('?')[0];

    if (excludePaths().includes(pathname)) {
      if (_exception instanceof HttpException) {
        response.status(_exception.getStatus()).json(_exception.getResponse());
      } else {
        response
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Internal server error' });
      }
      return;
    }

    const { error } = buildErrorPayload(apiPrefix, request.method, url, _exception);
    response.type(PROBLEM_CONTENT_TYPE).status(error.status).json({ error });
  }
}

import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import * as _ from 'lodash';
import { URL } from 'url';

import { CONFIG_OPTIONS } from '../constants';

@Controller('health')
export class ReadinessController {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly appConfig: Typings.AppConfig,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get('readiness')
  @HealthCheck()
  async check() {
    const servicesPingCheckList = _.has(this.appConfig, 'services')
      ? Object.keys(this.appConfig.services).map((_key) => {
          const {
            url,
            timeout = 0,
            healthPath = '/health/liveness',
          } = this.appConfig.services[_key];
          const urlService = new URL(url);
          /* istanbul ignore next */
          return () =>
            this.http.pingCheck(`${_key}`, `${urlService.origin}${healthPath}`, { timeout });
        })
      : /* istanbul ignore next */ [];

    return this.health.check([...servicesPingCheckList]);
  }
}

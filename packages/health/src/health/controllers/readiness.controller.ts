import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';
import { Typings } from '@tresdoce-nestjs-toolkit/core';
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
    const servicesPingCheckList = Object.keys(this.appConfig.services).map((key) => {
      const { url, timeout = 0, healthPath = '/health/liveness' } = this.appConfig.services[key];
      const urlService = new URL(url);
      /* istanbul ignore next */
      return () => this.http.pingCheck(`${key}`, `${urlService.origin}${healthPath}`, { timeout });
    });
    return this.health.check([...servicesPingCheckList]);
  }
}

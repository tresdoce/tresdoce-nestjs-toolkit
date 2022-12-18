import { Controller, Get, Inject } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
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
    private typeOrm: TypeOrmHealthIndicator,
  ) {}

  @Get('readiness')
  @ApiExcludeEndpoint()
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

    const typeormCheckList = _.has(this.appConfig, 'database')
      ? Object.keys(this.appConfig.database).map((_key) => {
          /* istanbul ignore next */
          return () => this.typeOrm.pingCheck(`typeorm_${this.appConfig.database.typeorm.type}`);
        })
      : /* istanbul ignore next */ [];

    return this.health.check([...servicesPingCheckList, ...typeormCheckList]);
  }
}

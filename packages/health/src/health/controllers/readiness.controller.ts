import { Controller, Get, Inject } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { RedisOptions, Transport } from '@nestjs/microservices';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import _ from 'lodash';
import { URL } from 'url';

import { CONFIG_OPTIONS } from '../constants';

@Controller('health')
export class ReadinessController {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly appConfig: Typings.AppConfig,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private typeOrm: TypeOrmHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
  ) {}

  @Get('readiness')
  @ApiExcludeEndpoint()
  @HealthCheck()
  async check() {
    /** HealthChecks Services */
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

    /** HealthChecks TypeORM */
    const typeormCheckList = _.has(this.appConfig, 'database')
      ? Object.keys(this.appConfig.database).map((_key) => {
          /* istanbul ignore next */
          return () => this.typeOrm.pingCheck(`typeorm_${this.appConfig.database.typeorm.type}`);
        })
      : /* istanbul ignore next */ [];

    /** HealthChecks Redis */
    const redisCheckList = _.has(this.appConfig, 'redis')
      ? Object.keys(this.appConfig.redis).map((_key) => {
          /* istanbul ignore next */
          return () =>
            this.microservice.pingCheck<RedisOptions>(`${this.appConfig.redis.name}` || 'redis', {
              transport: Transport.REDIS,
              options: {
                host: this.appConfig.redis.host,
                port: this.appConfig.redis.port,
                password: this.appConfig.redis.password,
                username: this.appConfig.redis.username,
              },
            });
        })
      : /* istanbul ignore next */ [];

    /** HealthChecks ElasticSearch */
    const elkCheckList = _.has(this.appConfig, 'elasticsearch')
      ? Object.keys(this.appConfig.elasticsearch).map((_key) => {
          /* istanbul ignore next */
          return () => this.http.pingCheck('elasticsearch', `${this.appConfig.elasticsearch.node}`);
        })
      : /* istanbul ignore next */ [];

    /** HealthChecks Camunda */
    const camundaCheckList = _.has(this.appConfig, 'camunda')
      ? Object.keys(this.appConfig.camunda).map((_key) => {
          /* istanbul ignore next */
          return () => this.http.pingCheck('camunda', `${this.appConfig.camunda.baseUrl}/version`);
        })
      : /* istanbul ignore next */ [];

    return this.health.check([
      ...servicesPingCheckList,
      ...typeormCheckList,
      ...redisCheckList,
      ...elkCheckList,
      ...camundaCheckList,
    ]);
  }
}

import { Controller, Get, Inject } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
  MicroserviceHealthIndicator,
  HealthCheckResult,
  HealthIndicatorResult,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { SkipTrace } from '@tresdoce-nestjs-toolkit/tracing';
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import _ from 'lodash';
import { URL } from 'url';

import { CONFIG_OPTIONS, DEFAULT_SERVICE_LIVENESS_PATH } from '../constants';

@Controller('health')
@ApiTags('Monitoring')
export class ReadinessController {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly appConfig: Typings.AppConfig,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private typeOrm: TypeOrmHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
  ) {}

  @Get('readiness')
  @ApiExcludeEndpoint()
  @ApiOperation({
    summary: 'Readiness check',
    description:
      'This endpoint returns the readiness status of the service. It is used to check if the service is ready to accept traffic.',
    operationId: 'checkReadiness',
  })
  @HealthCheck()
  @SkipTrace()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      ...this.getDiskChecks(),
      ...this.getMemoryChecks(),
      ...this.getServicesPingChecks(),
      ...this.getTypeOrmChecks(),
      ...this.getRedisChecks(),
      ...this.getElkChecks(),
      ...this.getCamundaChecks(),
    ]);
  }

  private getDiskChecks() {
    if (
      !_.has(this.appConfig.health, 'storage') ||
      _.isEmpty(this.appConfig.health.storage) ||
      _.includes(this.appConfig.health.skipChecks, 'storage')
    )
      return [];

    const { storage } = this.appConfig.health;
    /* istanbul ignore next */
    if (!Object.keys(storage).length) return [];
    /* istanbul ignore next */
    return [
      async (): Promise<HealthIndicatorResult> => this.disk.checkStorage('storage', { ...storage }),
    ];
  }

  private getMemoryChecks() {
    if (
      !_.has(this.appConfig.health, 'memory') ||
      _.isEmpty(this.appConfig.health.memory) ||
      _.includes(this.appConfig.health.skipChecks, 'memory')
    )
      return [];

    const { memory } = this.appConfig.health;
    /* istanbul ignore next */
    if (!Object.keys(memory).length) return [];
    /* istanbul ignore next */
    return [
      async (): Promise<HealthIndicatorResult> => this.memory.checkHeap('memory_heap', memory.heap),
      async (): Promise<HealthIndicatorResult> => this.memory.checkRSS('memory_rss', memory.rss),
    ];
  }

  private getServicesPingChecks() {
    /* istanbul ignore next */
    if (!_.has(this.appConfig, 'services') || _.isEmpty(this.appConfig.services)) return [];

    const { services } = this.appConfig;
    /* istanbul ignore next */
    if (!Object.keys(services).length) return [];
    /* istanbul ignore next */
    return Object.entries(services).map(([_key, _service]) => {
      const { url, timeout = 0, healthPath = DEFAULT_SERVICE_LIVENESS_PATH } = _service;
      const urlService = new URL(url);

      return async (): Promise<HealthIndicatorResult> =>
        this.http.pingCheck(`service-${_key}`, `${urlService.origin}${healthPath}`, {
          timeout,
        });
    });
  }

  private getTypeOrmChecks() {
    if (
      !_.has(this.appConfig, 'database.typeorm') ||
      _.isEmpty(this.appConfig.database.typeorm) ||
      _.includes(this.appConfig.health.skipChecks, 'typeorm')
    )
      return [];

    const {
      database: { typeorm },
    } = this.appConfig;
    /* istanbul ignore next */
    if (!Object.keys(typeorm).length) return [];
    /* istanbul ignore next */
    return [
      async (): Promise<HealthIndicatorResult> => this.typeOrm.pingCheck(`typeorm-${typeorm.type}`),
    ];
  }

  private getRedisChecks() {
    if (
      !_.has(this.appConfig, 'redis') ||
      _.isEmpty(this.appConfig.redis) ||
      _.includes(this.appConfig.health.skipChecks, 'redis')
    )
      return [];

    const { redis } = this.appConfig;
    /* istanbul ignore next */
    if (!Object.keys(redis).length) return [];

    /* istanbul ignore next */
    const redisName =
      _.has(redis, 'name') && !_.isEmpty(redis.name) ? `redis-${redis.name}` : 'redis';

    /* istanbul ignore next */
    return [
      async (): Promise<HealthIndicatorResult> =>
        this.microservice.pingCheck(redisName, {
          transport: Transport.REDIS,
          options: { ...redis },
        }),
    ];
  }

  private getElkChecks() {
    if (
      !_.has(this.appConfig, 'elasticsearch') ||
      _.isEmpty(this.appConfig.elasticsearch) ||
      _.includes(this.appConfig.health.skipChecks, 'elasticsearch')
    )
      return [];

    const { elasticsearch } = this.appConfig;
    /* istanbul ignore next */
    if (!Object.keys(elasticsearch).length) return [];

    /* istanbul ignore next */
    const options =
      _.has(elasticsearch, 'auth') && !_.isEmpty(elasticsearch.auth)
        ? { auth: elasticsearch.auth }
        : {};

    /* istanbul ignore next */
    return [
      async (): Promise<HealthIndicatorResult> =>
        this.http.pingCheck(`elasticsearch`, `${elasticsearch.node}`, options),
    ];
  }

  private getCamundaChecks() {
    if (
      !_.has(this.appConfig, 'camunda') ||
      _.isEmpty(this.appConfig.camunda) ||
      _.includes(this.appConfig.health.skipChecks, 'camunda')
    )
      return [];

    const { camunda } = this.appConfig;
    /* istanbul ignore next */
    if (!Object.keys(camunda).length) return [];
    /* istanbul ignore next */
    return [
      async (): Promise<HealthIndicatorResult> =>
        this.http.pingCheck(`camunda`, `${camunda.baseUrl}/version`),
    ];
  }
}

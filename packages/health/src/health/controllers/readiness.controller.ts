import { Controller, Get, Inject } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
  MicroserviceHealthIndicator,
  HealthIndicatorService,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  type HealthCheckResult,
  type HealthIndicatorFunction,
} from '@nestjs/terminus';
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { SkipTrace } from '@tresdoce-nestjs-toolkit/tracing';
import { Public, type Typings } from '@tresdoce-nestjs-toolkit/core';
import _ from 'lodash';

import { CONFIG_OPTIONS, DEFAULT_SERVICE_LIVENESS_PATH } from '../constants.js';

type ElasticsearchConfig = Typings.AppConfig['elasticsearch'];

@Controller('health')
@ApiTags('Monitoring')
export class ReadinessController {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly appConfig: Typings.AppConfig,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly typeOrm: TypeOrmHealthIndicator,
    private readonly microservice: MicroserviceHealthIndicator,
    private readonly healthIndicator: HealthIndicatorService,
  ) {}

  @Public()
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

  /** `true` si `path` existe en la config, no está vacío y el check no fue omitido en `health.skipChecks`. */
  private isEnabled(path: string, check?: Typings.TSkipHealthChecks): boolean {
    return (
      !_.isEmpty(_.get(this.appConfig, path)) &&
      !(this.appConfig.health?.skipChecks ?? []).includes(check)
    );
  }

  private getDiskChecks(): HealthIndicatorFunction[] {
    if (!this.isEnabled('health.storage', 'storage')) return [];
    const { storage } = this.appConfig.health;
    return [() => this.disk.checkStorage('storage', { ...storage })];
  }

  private getMemoryChecks(): HealthIndicatorFunction[] {
    if (!this.isEnabled('health.memory', 'memory')) return [];
    const { heap, rss } = this.appConfig.health.memory;
    const checks: HealthIndicatorFunction[] = [];
    if (Number.isFinite(heap)) checks.push(() => this.memory.checkHeap('memory_heap', heap));
    if (Number.isFinite(rss)) checks.push(() => this.memory.checkRSS('memory_rss', rss));
    return checks;
  }

  private getServicesPingChecks(): HealthIndicatorFunction[] {
    if (!this.isEnabled('services')) return [];

    return Object.entries(this.appConfig.services).map(([key, service]) => {
      const name = `service-${key}`;
      const { url, timeout = 0, healthPath = DEFAULT_SERVICE_LIVENESS_PATH } = service ?? {};

      if (!URL.canParse(url)) {
        return () => this.healthIndicator.check(name).down({ message: `Invalid URL: ${url}` });
      }

      const { origin } = new URL(url);
      return () => this.http.pingCheck(name, `${origin}${healthPath}`, { timeout });
    });
  }

  private getTypeOrmChecks(): HealthIndicatorFunction[] {
    if (!this.isEnabled('database.typeorm', 'typeorm')) return [];
    const { type } = this.appConfig.database.typeorm;
    return [() => this.typeOrm.pingCheck(`typeorm-${type}`)];
  }

  private getRedisChecks(): HealthIndicatorFunction[] {
    if (!this.isEnabled('redis', 'redis')) return [];

    const { redis } = this.appConfig;
    const redisName = _.isEmpty(redis.name) ? 'redis' : `redis-${redis.name}`;

    return [
      () =>
        this.microservice.pingCheck(redisName, {
          transport: Transport.REDIS,
          options: {
            host: redis.host,
            port: redis.port,
            username: redis.username,
            password: redis.password,
            ...(Number.isInteger(redis.database) && { db: redis.database }),
            ...(redis.protocol === 'rediss' && { tls: {} }),
          },
        }),
    ];
  }

  private getElkChecks(): HealthIndicatorFunction[] {
    if (!this.isEnabled('elasticsearch', 'elasticsearch')) return [];

    const { elasticsearch } = this.appConfig;
    return [
      () =>
        this.http.pingCheck(
          'elasticsearch',
          ReadinessController.getElasticsearchUrl(elasticsearch),
          ReadinessController.getElasticsearchAuth(elasticsearch.auth),
        ),
    ];
  }

  private getCamundaChecks(): HealthIndicatorFunction[] {
    if (!this.isEnabled('camunda', 'camunda')) return [];
    const { baseUrl } = this.appConfig.camunda;
    return [() => this.http.pingCheck('camunda', `${baseUrl}/version`)];
  }

  /** Primer nodo configurado (`node`/`nodes` aceptan string, string[], NodeOptions o NodeOptions[]). */
  private static getElasticsearchUrl({ node, nodes }: ElasticsearchConfig): string {
    const first = _.head(_.castArray(node ?? nodes));
    return String(typeof first === 'object' ? first.url : first);
  }

  /** Traduce `auth` del cliente de Elasticsearch a opciones de axios (basic, apiKey o bearer). */
  private static getElasticsearchAuth(auth: ElasticsearchConfig['auth']) {
    if (_.isEmpty(auth)) return {};
    if ('username' in auth) return { auth: { username: auth.username, password: auth.password } };
    if ('bearer' in auth) return { headers: { Authorization: `Bearer ${auth.bearer}` } };
    const apiKey =
      typeof auth.apiKey === 'string'
        ? auth.apiKey
        : Buffer.from(`${auth.apiKey.id}:${auth.apiKey.api_key}`).toString('base64');
    return { headers: { Authorization: `ApiKey ${apiKey}` } };
  }
}

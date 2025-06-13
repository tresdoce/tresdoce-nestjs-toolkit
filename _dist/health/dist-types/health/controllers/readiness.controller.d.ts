import { HealthCheckService, HttpHealthIndicator, TypeOrmHealthIndicator, MicroserviceHealthIndicator, HealthCheckResult, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { Typings } from '@tresdoce-nestjs-toolkit/core';
export declare class ReadinessController {
    private readonly appConfig;
    private readonly disk;
    private readonly memory;
    private health;
    private http;
    private typeOrm;
    private microservice;
    constructor(appConfig: Typings.AppConfig, disk: DiskHealthIndicator, memory: MemoryHealthIndicator, health: HealthCheckService, http: HttpHealthIndicator, typeOrm: TypeOrmHealthIndicator, microservice: MicroserviceHealthIndicator);
    check(): Promise<HealthCheckResult>;
    private getDiskChecks;
    private getMemoryChecks;
    private getServicesPingChecks;
    private getTypeOrmChecks;
    private getRedisChecks;
    private getElkChecks;
    private getCamundaChecks;
}

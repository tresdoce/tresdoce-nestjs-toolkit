var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator, TypeOrmHealthIndicator, MicroserviceHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator, } from '@nestjs/terminus';
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { SkipTrace } from '@tresdoce-nestjs-toolkit/tracing';
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import _ from 'lodash';
import { URL } from 'url';
import { CONFIG_OPTIONS, DEFAULT_SERVICE_LIVENESS_PATH } from '../constants';
let ReadinessController = class ReadinessController {
    constructor(appConfig, disk, memory, health, http, typeOrm, microservice) {
        this.appConfig = appConfig;
        this.disk = disk;
        this.memory = memory;
        this.health = health;
        this.http = http;
        this.typeOrm = typeOrm;
        this.microservice = microservice;
    }
    async check() {
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
    getDiskChecks() {
        if (!_.has(this.appConfig.health, 'storage') ||
            _.isEmpty(this.appConfig.health.storage) ||
            _.includes(this.appConfig.health.skipChecks, 'storage'))
            return [];
        const { storage } = this.appConfig.health;
        /* istanbul ignore next */
        if (!Object.keys(storage).length)
            return [];
        /* istanbul ignore next */
        return [
            async () => this.disk.checkStorage('storage', { ...storage }),
        ];
    }
    getMemoryChecks() {
        if (!_.has(this.appConfig.health, 'memory') ||
            _.isEmpty(this.appConfig.health.memory) ||
            _.includes(this.appConfig.health.skipChecks, 'memory'))
            return [];
        const { memory } = this.appConfig.health;
        /* istanbul ignore next */
        if (!Object.keys(memory).length)
            return [];
        /* istanbul ignore next */
        return [
            async () => this.memory.checkHeap('memory_heap', memory.heap),
            async () => this.memory.checkRSS('memory_rss', memory.rss),
        ];
    }
    getServicesPingChecks() {
        /* istanbul ignore next */
        if (!_.has(this.appConfig, 'services') || _.isEmpty(this.appConfig.services))
            return [];
        const { services } = this.appConfig;
        /* istanbul ignore next */
        if (!Object.keys(services).length)
            return [];
        /* istanbul ignore next */
        return Object.entries(services).map(([_key, _service]) => {
            const { url, timeout = 0, healthPath = DEFAULT_SERVICE_LIVENESS_PATH } = _service;
            const urlService = new URL(url);
            return async () => this.http.pingCheck(`service-${_key}`, `${urlService.origin}${healthPath}`, {
                timeout,
            });
        });
    }
    getTypeOrmChecks() {
        if (!_.has(this.appConfig, 'database.typeorm') ||
            _.isEmpty(this.appConfig.database.typeorm) ||
            _.includes(this.appConfig.health.skipChecks, 'typeorm'))
            return [];
        const { database: { typeorm }, } = this.appConfig;
        /* istanbul ignore next */
        if (!Object.keys(typeorm).length)
            return [];
        /* istanbul ignore next */
        return [
            async () => this.typeOrm.pingCheck(`typeorm-${typeorm.type}`),
        ];
    }
    getRedisChecks() {
        if (!_.has(this.appConfig, 'redis') ||
            _.isEmpty(this.appConfig.redis) ||
            _.includes(this.appConfig.health.skipChecks, 'redis'))
            return [];
        const { redis } = this.appConfig;
        /* istanbul ignore next */
        if (!Object.keys(redis).length)
            return [];
        /* istanbul ignore next */
        const redisName = _.has(redis, 'name') && !_.isEmpty(redis.name) ? `redis-${redis.name}` : 'redis';
        /* istanbul ignore next */
        return [
            async () => this.microservice.pingCheck(redisName, {
                transport: Transport.REDIS,
                options: { ...redis },
            }),
        ];
    }
    getElkChecks() {
        if (!_.has(this.appConfig, 'elasticsearch') ||
            _.isEmpty(this.appConfig.elasticsearch) ||
            _.includes(this.appConfig.health.skipChecks, 'elasticsearch'))
            return [];
        const { elasticsearch } = this.appConfig;
        /* istanbul ignore next */
        if (!Object.keys(elasticsearch).length)
            return [];
        /* istanbul ignore next */
        const options = _.has(elasticsearch, 'auth') && !_.isEmpty(elasticsearch.auth)
            ? { auth: elasticsearch.auth }
            : {};
        /* istanbul ignore next */
        return [
            async () => this.http.pingCheck(`elasticsearch`, `${elasticsearch.node}`, options),
        ];
    }
    getCamundaChecks() {
        if (!_.has(this.appConfig, 'camunda') ||
            _.isEmpty(this.appConfig.camunda) ||
            _.includes(this.appConfig.health.skipChecks, 'camunda'))
            return [];
        const { camunda } = this.appConfig;
        /* istanbul ignore next */
        if (!Object.keys(camunda).length)
            return [];
        /* istanbul ignore next */
        return [
            async () => this.http.pingCheck(`camunda`, `${camunda.baseUrl}/version`),
        ];
    }
};
__decorate([
    Get('readiness'),
    ApiExcludeEndpoint(),
    ApiOperation({
        summary: 'Readiness check',
        description: 'This endpoint returns the readiness status of the service. It is used to check if the service is ready to accept traffic.',
        operationId: 'checkReadiness',
    }),
    HealthCheck(),
    SkipTrace(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReadinessController.prototype, "check", null);
ReadinessController = __decorate([
    Controller('health'),
    ApiTags('Monitoring'),
    __param(0, Inject(CONFIG_OPTIONS)),
    __metadata("design:paramtypes", [Object, DiskHealthIndicator,
        MemoryHealthIndicator,
        HealthCheckService,
        HttpHealthIndicator,
        TypeOrmHealthIndicator,
        MicroserviceHealthIndicator])
], ReadinessController);
export { ReadinessController };

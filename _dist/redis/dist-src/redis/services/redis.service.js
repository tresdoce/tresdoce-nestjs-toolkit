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
import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from '../constants/redis.constants';
let RedisService = class RedisService {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
    get clientRef() {
        return this.redisClient;
    }
    /**
     * @Descripción: Return echo message
     * @Param msg {string}
     * @return: String
     */
    async echo(msg) {
        return this.clientRef.echo(msg);
    }
    /**
     * @Descripción: Return if exist key in Redis
     * @Param key {string}
     * @return: true | false
     */
    async exists(key) {
        return Boolean(await this.clientRef.exists(key));
    }
    /**
     * @Descripción: Save value in Redis
     * @Param key {string}
     * @Param value {any}
     * @Param seconds {number} expire data
     * @return: OK
     */
    async set(key, value, seconds) {
        const stringValue = JSON.stringify(value);
        return seconds
            ? await this.clientRef.setEx(key, seconds, stringValue)
            : await this.clientRef.set(key, stringValue);
    }
    /**
     * @Descripción: Get value of Redis by key
     * @param key {string}
     * @return:
     */
    async get(key) {
        const data = await this.clientRef.get(key);
        return data ? JSON.parse(data) : null;
    }
    /**
     * @Descripción: Delete data of Redis by key
     * @param key {string}
     * @return: true | false
     */
    async del(key) {
        return Boolean(await this.clientRef.del(key));
    }
    /**
     * @Descripción: Copy value in new key
     * @param source {string}
     * @param destination {string}
     * @return: true | false
     */
    async copy(source, destination) {
        const result = await this.clientRef.copy(source, destination);
        return result === 1;
    }
    /**
     * @Descripción: Rename key
     * @param key {string}
     * @param newKey {string}
     * @return: OK
     */
    async rename(key, newKey) {
        return this.clientRef.rename(key, newKey);
    }
    /**
     * @Descripción: Delete all Redis
     * @return: OK
     */
    async flushAll() {
        return this.clientRef.flushAll();
    }
};
RedisService = __decorate([
    Injectable(),
    __param(0, Inject(REDIS_CLIENT)),
    __metadata("design:paramtypes", [Object])
], RedisService);
export { RedisService };

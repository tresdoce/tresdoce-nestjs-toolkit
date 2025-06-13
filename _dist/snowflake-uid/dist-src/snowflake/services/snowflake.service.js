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
var SnowflakeService_1;
import { Inject, Injectable } from '@nestjs/common';
import { MAX_WORKER_ID, MAX_PROCESS_ID, SEQUENCE_MASK, SNOWFLAKE_MODULE_OPTIONS, } from '../constants/snowflake.constant';
let SnowflakeService = SnowflakeService_1 = class SnowflakeService {
    constructor(options) {
        this.options = options;
        const { epoch, workerId, processId, toString } = this.options;
        if (workerId === undefined || workerId < 0 || workerId > MAX_WORKER_ID) {
            throw new Error(`Worker ID must be between 0 and ${MAX_WORKER_ID}`);
        }
        if (processId === undefined || processId < 0 || processId > MAX_PROCESS_ID) {
            throw new Error(`Process ID must be between 0 and ${MAX_PROCESS_ID}`);
        }
        this.EPOCH = epoch;
        this.workerId = workerId;
        this.processId = processId;
        this.toString = toString;
    }
    generate(date = new Date()) {
        let timestamp = BigInt(date.valueOf());
        if (timestamp < this.EPOCH) {
            throw new Error('Invalid system clock: timestamp is before epoch');
        }
        if (timestamp < SnowflakeService_1.lastTimestamp) {
            throw new Error('Invalid system clock');
        }
        if (timestamp === SnowflakeService_1.lastTimestamp) {
            SnowflakeService_1.sequence = (SnowflakeService_1.sequence + 1) & SEQUENCE_MASK;
            if (SnowflakeService_1.sequence === 0) {
                timestamp = this.waitUntilNextMillis(SnowflakeService_1.lastTimestamp);
            }
        }
        else {
            SnowflakeService_1.sequence = 0;
        }
        SnowflakeService_1.lastTimestamp = timestamp;
        const timestampOffset = timestamp - this.EPOCH;
        const id = (timestampOffset << 22n) |
            (BigInt(this.workerId) << 17n) |
            (BigInt(this.processId) << 12n) |
            BigInt(SnowflakeService_1.sequence);
        return this.toString ? id.toString() : id;
    }
    isSnowflake(id) {
        try {
            const idBigInt = BigInt(id.toString());
            const timestamp = (idBigInt >> 22n) + this.EPOCH;
            if (timestamp <= this.EPOCH || timestamp > BigInt(Date.now())) {
                return false;
            }
            const workerId = Number((idBigInt >> 17n) & 0x1fn);
            /* istanbul ignore next */
            if (workerId < 0 || workerId > MAX_WORKER_ID) {
                return false;
            }
            const processId = Number((idBigInt >> 12n) & 0x1fn);
            /* istanbul ignore next */
            if (processId < 0 || processId > MAX_PROCESS_ID) {
                return false;
            }
            const sequence = Number(idBigInt & BigInt(SEQUENCE_MASK));
            return sequence >= 0 && sequence <= SEQUENCE_MASK;
        }
        catch {
            /* istanbul ignore next */
            return false;
        }
    }
    parse(snowflake) {
        const id = BigInt(snowflake);
        const timestamp = Number((id >> 22n) + this.EPOCH);
        const workerId = Number((id & 0x3e0000n) >> 17n);
        const processId = Number((id & 0x1f000n) >> 12n);
        const increment = Number(id & 0xfffn);
        return { timestamp, workerId, processId, increment };
    }
    waitUntilNextMillis(lastTimestamp) {
        let timestamp = BigInt(Date.now());
        while (timestamp <= lastTimestamp) {
            /* istanbul ignore next */
            timestamp = BigInt(Date.now());
        }
        return timestamp;
    }
};
SnowflakeService.lastTimestamp = -1n;
SnowflakeService.sequence = 0;
SnowflakeService = SnowflakeService_1 = __decorate([
    Injectable(),
    __param(0, Inject(SNOWFLAKE_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], SnowflakeService);
export { SnowflakeService };

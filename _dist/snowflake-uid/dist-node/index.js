'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common = require('@nestjs/common');
var config = require('@nestjs/config');

const SNOWFLAKE_MODULE_OPTIONS = Symbol('SNOWFLAKE_MODULE_OPTIONS');
const DEFAULT_EPOCH = 1577836800000n;
const DEFAULT_WORKER_ID = 1;
const DEFAULT_PROCESS_ID = 1;
const DEFAULT_TO_STRING = false;
const DEFAULT_SNOWFLAKE_MODULE_OPTIONS = {
  epoch: DEFAULT_EPOCH,
  workerId: DEFAULT_WORKER_ID,
  processId: DEFAULT_PROCESS_ID,
  toString: DEFAULT_TO_STRING
};
const WORKER_ID_BITS = 5;
const PROCESS_ID_BITS = 5;
const SEQUENCE_BITS = 12;
const MAX_WORKER_ID = -1 ^ -1 << WORKER_ID_BITS;
const MAX_PROCESS_ID = -1 ^ -1 << PROCESS_ID_BITS;
const SEQUENCE_MASK = -1 ^ -1 << SEQUENCE_BITS;

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = undefined && undefined.__metadata || function (k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = undefined && undefined.__param || function (paramIndex, decorator) {
  return function (target, key) {
    decorator(target, key, paramIndex);
  };
};
var SnowflakeService_1;
exports.SnowflakeService = SnowflakeService_1 = class SnowflakeService {
  constructor(options) {
    this.options = options;
    const {
      epoch,
      workerId,
      processId,
      toString
    } = this.options;
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
      SnowflakeService_1.sequence = SnowflakeService_1.sequence + 1 & SEQUENCE_MASK;
      if (SnowflakeService_1.sequence === 0) {
        timestamp = this.waitUntilNextMillis(SnowflakeService_1.lastTimestamp);
      }
    } else {
      SnowflakeService_1.sequence = 0;
    }
    SnowflakeService_1.lastTimestamp = timestamp;
    const timestampOffset = timestamp - this.EPOCH;
    const id = timestampOffset << 22n | BigInt(this.workerId) << 17n | BigInt(this.processId) << 12n | BigInt(SnowflakeService_1.sequence);
    return this.toString ? id.toString() : id;
  }
  isSnowflake(id) {
    try {
      const idBigInt = BigInt(id.toString());
      const timestamp = (idBigInt >> 22n) + this.EPOCH;
      if (timestamp <= this.EPOCH || timestamp > BigInt(Date.now())) {
        return false;
      }
      const workerId = Number(idBigInt >> 17n & 0x1fn);
      /* istanbul ignore next */
      if (workerId < 0 || workerId > MAX_WORKER_ID) {
        return false;
      }
      const processId = Number(idBigInt >> 12n & 0x1fn);
      /* istanbul ignore next */
      if (processId < 0 || processId > MAX_PROCESS_ID) {
        return false;
      }
      const sequence = Number(idBigInt & BigInt(SEQUENCE_MASK));
      return sequence >= 0 && sequence <= SEQUENCE_MASK;
    } catch (_unused) {
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
    return {
      timestamp,
      workerId,
      processId,
      increment
    };
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
exports.SnowflakeService.lastTimestamp = -1n;
exports.SnowflakeService.sequence = 0;
exports.SnowflakeService = SnowflakeService_1 = __decorate([common.Injectable(), __param(0, common.Inject(SNOWFLAKE_MODULE_OPTIONS)), __metadata("design:paramtypes", [Object])], exports.SnowflakeService);

var __decorate$1 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.SnowflakeModule = class SnowflakeModule {};
exports.SnowflakeModule = __decorate$1([common.Global(), common.Module({
  imports: [config.ConfigModule],
  providers: [exports.SnowflakeService, {
    provide: SNOWFLAKE_MODULE_OPTIONS,
    useFactory: async configService => configService.get('config.snowflakeUID') || DEFAULT_SNOWFLAKE_MODULE_OPTIONS,
    inject: [config.ConfigService]
  }],
  exports: [exports.SnowflakeService, SNOWFLAKE_MODULE_OPTIONS]
})], exports.SnowflakeModule);

exports.DEFAULT_EPOCH = DEFAULT_EPOCH;
exports.DEFAULT_PROCESS_ID = DEFAULT_PROCESS_ID;
exports.DEFAULT_SNOWFLAKE_MODULE_OPTIONS = DEFAULT_SNOWFLAKE_MODULE_OPTIONS;
exports.DEFAULT_TO_STRING = DEFAULT_TO_STRING;
exports.DEFAULT_WORKER_ID = DEFAULT_WORKER_ID;
exports.MAX_PROCESS_ID = MAX_PROCESS_ID;
exports.MAX_WORKER_ID = MAX_WORKER_ID;
exports.PROCESS_ID_BITS = PROCESS_ID_BITS;
exports.SEQUENCE_BITS = SEQUENCE_BITS;
exports.SEQUENCE_MASK = SEQUENCE_MASK;
exports.SNOWFLAKE_MODULE_OPTIONS = SNOWFLAKE_MODULE_OPTIONS;
exports.WORKER_ID_BITS = WORKER_ID_BITS;
//# sourceMappingURL=index.js.map

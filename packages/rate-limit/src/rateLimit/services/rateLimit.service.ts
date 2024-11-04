import { Inject, Injectable } from '@nestjs/common';

import { RATE_LIMIT_MODULE_OPTIONS } from '../constants/rateLimit.constant';
import { RateLimitModuleOptions } from '../interfaces/rateLimit.interface';

@Injectable()
export class RateLimitService {
  constructor(
    @Inject(RATE_LIMIT_MODULE_OPTIONS) private readonly options: RateLimitModuleOptions,
  ) {}
  getHello(): string {
    return `¡Hello ${this.options.apiName} from the new module rate-limit!`;
  }
}

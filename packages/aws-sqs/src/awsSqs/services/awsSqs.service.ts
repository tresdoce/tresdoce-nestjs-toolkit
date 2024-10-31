import { Inject, Injectable } from '@nestjs/common';

import { AWS_SQS_MODULE_OPTIONS } from '../constants/awsSqs.constant';
import { AwsSqsModuleOptions } from '../interfaces/awsSqs.interface';

@Injectable()
export class AwsSqsService {
  constructor(@Inject(AWS_SQS_MODULE_OPTIONS) private readonly options: AwsSqsModuleOptions) {}
  getHello(): string {
    return `¡Hello ${this.options.apiName} from the new module aws-sqs!`;
  }
}

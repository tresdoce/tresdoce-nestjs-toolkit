import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BcryptService } from './services/bcrypt.service';
import { BCRYPT_DEFAULT_OPTIONS, BCRYPT_MODULE_OPTIONS } from './constants/bcrypt.constant';
import { BcryptOptions } from './interfaces/bcrypt.interface';

@Global()
@Module({
  providers: [
    BcryptService,
    {
      provide: BCRYPT_MODULE_OPTIONS,
      useFactory: async (_configService: ConfigService): Promise<BcryptOptions> => ({
        ...BCRYPT_DEFAULT_OPTIONS,
        ..._configService.get<BcryptOptions>('config.bcrypt'),
      }),
      inject: [ConfigService],
    },
  ],
  exports: [BcryptService],
})
export class BcryptModule {}

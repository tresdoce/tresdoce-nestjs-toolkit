import { Test, TestingModule } from '@nestjs/testing';
import { REDACT_PROVIDER } from '../redact/constants/redact.constant';
import {
  RedactModule,
  RedactModuleOptions,
  RedactModuleAsyncOptions,
  RedactModuleOptionsFactory,
} from '../';
import { ConfigModule } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

describe('RedactModule', () => {
  describe('default', () => {
    it('should define the REDACT_PROVIDER', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [RedactModule],
      }).compile();

      const provider = module.get(REDACT_PROVIDER);
      expect(provider).toBeDefined();
      expect(provider({ apiKey: '123456789' })).toEqual({ apiKey: '123456789' });
    });

    it('should define the REDACT_PROVIDER with configModule', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [
              dynamicConfig({
                redact: {
                  paths: ['apiKey'],
                },
              }),
            ],
          }),
          RedactModule,
        ],
      }).compile();

      const provider = module.get(REDACT_PROVIDER);
      expect(provider).toBeDefined();
      expect(provider({ apiKey: '123456789' })).toEqual({ apiKey: '12345****' });
    });
  });

  describe('register', () => {
    it('should provide the REDACT_PROVIDER', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          RedactModule.register({
            paths: ['apiKey'],
            obfuscateFrom: 'left',
          }),
        ],
      }).compile();

      const provider = module.get(REDACT_PROVIDER);
      expect(provider).toBeDefined();
      expect(provider({ apiKey: '123456789' })).toEqual({ apiKey: '****56789' });
    });

    it('should provide the REDACT_PROVIDER values empty', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [RedactModule.register({})],
      }).compile();

      const provider = module.get(REDACT_PROVIDER);
      expect(provider).toBeDefined();
      expect(provider({ apiKey: '123456789' })).toEqual({ apiKey: '123456789' });
    });
  });

  describe('registerAsync', () => {
    it('should provide the REDACT_PROVIDER using useFactory', async () => {
      const newCensor = 'XXXX';
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          RedactModule.registerAsync({
            useFactory: () => ({
              paths: ['apiKey'],
              censor: (value): string =>
                `[${newCensor}${value.toString().substring(newCensor.length)}]`,
            }),
          }),
        ],
      }).compile();

      const provider = module.get(REDACT_PROVIDER);
      expect(provider).toBeDefined();
      expect(provider({ apiKey: '123456789' })).toEqual({ apiKey: '[XXXX56789]' });
    });

    it('should provide the REDACT_PROVIDER using useClass', async () => {
      class TestClass implements RedactModuleOptionsFactory {
        async createRedactOptions(): Promise<RedactModuleOptions> {
          return {
            paths: ['apiKey'],
          };
        }
      }

      const options: RedactModuleAsyncOptions = {
        useClass: TestClass,
      };

      const module: TestingModule = await Test.createTestingModule({
        imports: [RedactModule.registerAsync(options)],
      }).compile();

      const provider = module.get(REDACT_PROVIDER);
      expect(provider).toBeDefined();
      expect(provider({ apiKey: '123456789' })).toEqual({ apiKey: '12345****' });
    });
  });
});

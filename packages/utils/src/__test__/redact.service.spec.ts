import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

import { RedactModule } from '../redact/redact.module.js';
import { RedactService } from '../redact/services/redact.service.js';

describe('RedactService', () => {
  let app: INestApplication;
  let service: RedactService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            dynamicConfig({
              redact: {
                paths: ['apiKey', 'pin', 'card', 'short', 'missing', 'nil'],
              },
            }),
          ],
        }),
        RedactModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    service = module.get<RedactService>(RedactService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(RedactService);
    expect(service.redactRef).not.toBeNull();
  });

  it('should be obfuscate sensitive data', async () => {
    const redacted = service.obfuscate({ apiKey: '123456789' });
    expect(redacted).toEqual({ apiKey: '12345****' });
  });

  it('should be obfuscate sensitive data with serialize', async () => {
    const redacted = service.obfuscate({ apiKey: '123456789' }, false);
    expect(redacted).toEqual(JSON.stringify({ apiKey: '12345****' }));
  });

  it('should fully censor non string values and short strings', async () => {
    const original = {
      apiKey: '123456789',
      pin: 1234,
      card: { number: '4111' },
      short: 'abc',
      nil: null,
    };
    const redacted = service.obfuscate(original);
    expect(redacted).toEqual({
      apiKey: '12345****',
      pin: '****',
      card: '****',
      short: '****',
      nil: null,
    });
    expect(original.apiKey).toBe('123456789');
  });
});

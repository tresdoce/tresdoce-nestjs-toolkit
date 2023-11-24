import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

import { RedactModule } from '../redact/redact.module';
import { RedactService } from '../redact/services/redact.service';

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
                paths: ['apiKey'],
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
});

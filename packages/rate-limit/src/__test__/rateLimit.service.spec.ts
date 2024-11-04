import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { config } from '@tresdoce-nestjs-toolkit/test-utils';

import { RateLimitModule, RateLimitService } from '..';

describe('RateLimitService', () => {
  let service: RateLimitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        RateLimitModule,
      ],
      providers: [RateLimitService],
    }).compile();

    service = module.get<RateLimitService>(RateLimitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be return message when call the getHello function', () => {
    expect(service.getHello()).toBe(
      `¡Hello ${config().project.name} from the new module rate-limit!`,
    );
  });
});

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { REDIS_CLIENT, RedisModule } from '@tresdoce-nestjs-toolkit/redis';

import { AuthModule } from '../auth/auth.module.js';
import { AUTH_MODULE_OPTIONS } from '../auth/constants/auth.constants.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { TokenService } from '../auth/services/token.service.js';

describe('AuthModule', () => {
  let app: INestApplication;

  const createApp = async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        RedisModule.register({ host: 'localhost', port: 6379 }),
        AuthModule.register({ jwtSecret: 'test-secret' }),
      ],
    })
      .overrideProvider(REDIS_CLIENT)
      .useValue({ quit: vi.fn().mockResolvedValue('OK') })
      .compile();

    app = module.createNestApplication();
    await app.init();

    return module;
  };

  afterEach(async () => {
    await app?.close();
  });

  it('should be defined', async () => {
    const module = await createApp();

    expect(app).toBeDefined();
    expect(module.get(TokenService)).toBeDefined();
    expect(module.get(JwtAuthGuard)).toBeDefined();
  });

  it('should resolve its options with registerAsync', async () => {
    const useFactory = vi.fn(async () => ({
      jwtSecret: 'async-secret',
      algorithm: 'HS512' as const,
    }));
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        RedisModule.register({ host: 'localhost', port: 6379 }),
        AuthModule.registerAsync({ useFactory }),
      ],
    })
      .overrideProvider(REDIS_CLIENT)
      .useValue({ quit: vi.fn().mockResolvedValue('OK') })
      .compile();

    app = module.createNestApplication();
    await app.init();

    expect(module.get(TokenService)).toBeDefined();
    expect(module.get(AUTH_MODULE_OPTIONS)).toEqual({
      jwtSecret: 'async-secret',
      algorithm: 'HS512',
    });
    expect(useFactory).toHaveBeenCalledTimes(1);
  });
});

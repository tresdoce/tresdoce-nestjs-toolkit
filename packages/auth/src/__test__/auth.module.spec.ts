import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { REDIS_CLIENT, RedisModule } from '@tresdoce-nestjs-toolkit/redis';

import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TokenService } from '../auth/services/token.service';

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
      .useValue({ quit: jest.fn().mockResolvedValue('OK') })
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
});

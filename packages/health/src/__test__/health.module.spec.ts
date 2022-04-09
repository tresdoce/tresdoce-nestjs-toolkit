import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthModule } from '../health/health.module';

const config = {
  services: {
    rickAndMortyAPI: {
      url: 'https://rickandmortyapi.com/api/character/1',
      timeout: 3000,
    },
  },
};

describe('HealthModule', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HealthModule.register(config)],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('should be define', async () => {
    expect(app).toBeDefined();
  });
});

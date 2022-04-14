import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthModule } from '../lib/health.module';

const mockedConfig = {
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
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [jest.fn().mockImplementation(() => mockedConfig)],
        }),
        HealthModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('should be define', async () => {
    expect(app).toBeDefined();
  });
});

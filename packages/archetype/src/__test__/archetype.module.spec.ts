import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { ArchetypeModule } from '../archetype/archetype.module';
import { config } from './utils';

describe('ArchetypeModule', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        ArchetypeModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('should be define', async () => {
    expect(app).toBeDefined();
  });
});

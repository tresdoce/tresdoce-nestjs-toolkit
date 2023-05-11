import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';

import { config, manifest } from '@tresdoce-nestjs-toolkit/test-utils';

import { ArchetypeModule } from '../archetype/archetype.module';
import { ArchetypeController } from '../archetype/controllers/archetype.controller';
import { ArchetypeService } from '../archetype/services/archetype.service';

describe('ArchetypeController', () => {
  let controller: ArchetypeController;
  const archetypeService = {
    generateManifest: () => manifest,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        ArchetypeModule,
      ],
      controllers: [ArchetypeController],
      providers: [ArchetypeService],
    })
      .overrideProvider(ArchetypeService)
      .useValue(archetypeService)
      .compile();

    controller = module.get<ArchetypeController>(ArchetypeController);
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  }, 1000);

  it('should be return manifest json', async () => {
    expect(await controller.getArchetypeInfo()).toBeDefined();
    expect(await controller.getArchetypeInfo()).toEqual(manifest);
  });
});

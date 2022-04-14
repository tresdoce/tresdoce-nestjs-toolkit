import { Test, TestingModule } from '@nestjs/testing';
import { LivenessController } from '../lib/controllers/liveness.controller';

describe('LivenessController', () => {
  let controller: LivenessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LivenessController],
    }).compile();

    controller = module.get<LivenessController>(LivenessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be return up liveness', () => {
    expect(controller.getLiveness()).toEqual({ status: 'up' });
  });
});

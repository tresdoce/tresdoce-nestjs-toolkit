import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TracingInterceptor } from '../lib/interceptors/tracing.interceptor';
import { TracingService } from '../lib/services/tracing.service';
import { TracingModule } from '../lib/tracing.module';

let service: TracingService;
let interceptor: TracingInterceptor;
const executionContext: any = {
  switchToHttp: jest.fn().mockReturnThis(),
  getRequest: jest.fn().mockReturnThis(),
  getResponse: jest.fn().mockReturnThis(),
  getType: jest.fn().mockReturnThis(),
  getClass: jest.fn().mockReturnThis(),
  getHandler: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
};

const callHandler: any = {
  handle: jest.fn(() => ({
    pipe: jest.fn(() => ({
      tap: jest.fn(),
    })),
  })),
};

describe('TracingInterceptor', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TracingModule],
    }).compile();
    app = module.createNestApplication();
    await app.init;
    service = module.get<TracingService>(TracingService);
    interceptor = new TracingInterceptor(service);
  });

  it('should be defined', () => {
    expect(new TracingInterceptor(service)).toBeDefined();
  });

  it('should be intercept and pass headers', async () => {
    const actualValue = await interceptor.intercept(executionContext, callHandler);
    expect(callHandler.handle).toBeCalledTimes(1);
  });
});

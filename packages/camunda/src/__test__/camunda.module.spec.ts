import { Test, TestingModule } from '@nestjs/testing';
import {
  CallHandler,
  Controller,
  ExecutionContext,
  INestApplication,
  Injectable,
  Logger,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Ctx, MessagePattern, Payload } from '@nestjs/microservices';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';
import { tap } from 'rxjs';

import { CamundaModule } from '../camunda/camunda.module.js';
import { Subscription } from '../camunda/decorators/camunda.decorator.js';
import { CamundaTaskConnector } from '../camunda/providers/camunda.provider.js';
import { CAMUNDA_SUBSCRIBE_OPTIONS } from '../camunda/constants/camunda.constants.js';
import { Client, Variables, BasicAuthInterceptor, logger } from '../index.js';

const calls = vi.hoisted(() => ({ handled: [] as any[], intercepted: 0 }));

@Injectable()
class CountInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(tap(() => calls.intercepted++));
  }
}

@Controller()
class WorkerController {
  @Subscription('with-options', { lockDuration: 500, variables: ['username', 'email'] })
  withOptions(@Payload() task: any, @Ctx() taskService: any) {
    calls.handled.push({ topic: 'with-options', task, taskService });
  }

  @Subscription('without-options')
  @UseInterceptors(CountInterceptor)
  withoutOptions(@Payload() task: any) {
    calls.handled.push({ topic: 'without-options', task });
  }

  @Subscription('failing')
  failing() {
    throw new Error('boom');
  }

  @MessagePattern({ topic: 'legacy', options: { lockDuration: 100 } })
  legacy() {}

  @MessagePattern({ topic: 'legacy-no-options' })
  legacyNoOptions() {}

  @MessagePattern('plain-pattern')
  plain() {}
}

describe('CamundaModule', () => {
  let app: INestApplication;
  let camundaTaskConnector: CamundaTaskConnector;
  let pollSpy: any;

  beforeEach(async () => {
    calls.handled = [];
    calls.intercepted = 0;
    // Avoid real HTTP calls against the engine.
    pollSpy = vi.spyOn(Client.prototype as any, 'poll').mockImplementation(async () => undefined);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        await ConfigModule.forRoot({
          isGlobal: true,
          load: [dynamicConfig({ camunda: { baseUrl: 'http://localhost:8080/engine-rest' } })],
        }),
        CamundaModule,
      ],
      controllers: [WorkerController],
    }).compile();

    app = moduleFixture.createNestApplication();
    camundaTaskConnector = app.get(CamundaTaskConnector);
    app.connectMicroservice({ strategy: camundaTaskConnector });

    await app.startAllMicroservices();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    pollSpy.mockRestore();
  });

  const subscriptions = () => camundaTaskConnector['client']['topicSubscriptions'];

  it('should be defined', () => {
    expect(app).toBeDefined();
    expect(camundaTaskConnector).toBeInstanceOf(CamundaTaskConnector);
  });

  it('should re-export the runtime values of camunda-external-task-client-js', () => {
    expect(Client).toBeTypeOf('function');
    expect(Variables).toBeTypeOf('function');
    expect(BasicAuthInterceptor).toBeTypeOf('function');
    expect(logger).toBeTypeOf('function');
  });

  it('should store the subscribe options in the pattern extras', () => {
    const decorator = Subscription('test-topic', { lockDuration: 500 });
    const descriptor = { value: () => undefined };
    decorator({}, 'method', descriptor);
    expect(Reflect.getMetadata('microservices:pattern_extras', descriptor.value)).toEqual({
      [CAMUNDA_SUBSCRIBE_OPTIONS]: { lockDuration: 500 },
    });
  });

  it('should not auto poll on instantiation and start polling once on listen', () => {
    expect(camundaTaskConnector['client']['options'].autoPoll).toBe(false);
    expect(pollSpy).toHaveBeenCalledTimes(1);
    expect(camundaTaskConnector['client']['_isPollAllowed']).toBe(true);
  });

  it('should subscribe every handler keeping the options untouched (arrays included)', () => {
    const subs = subscriptions();
    expect(Object.keys(subs).sort()).toEqual(
      [
        'failing',
        'legacy',
        'legacy-no-options',
        'plain-pattern',
        'with-options',
        'without-options',
      ].sort(),
    );
    expect(subs['with-options'].lockDuration).toBe(500);
    expect(subs['with-options'].variables).toEqual(['username', 'email']);
    expect(subs['without-options'].lockDuration).toBe(50000);
    expect(subs['legacy'].lockDuration).toBe(100);
    expect(subs['legacy-no-options'].lockDuration).toBe(50000);
    expect(subs['plain-pattern'].lockDuration).toBe(50000);
  });

  it('should run the handler with task (payload) and taskService (context)', async () => {
    const task = { id: '1' };
    const taskService = { complete: vi.fn() };
    await subscriptions()['with-options'].handler({ task, taskService });
    expect(calls.handled).toEqual([{ topic: 'with-options', task, taskService }]);
  });

  it('should subscribe to the observable so interceptors run', async () => {
    await subscriptions()['without-options'].handler({ task: { id: '2' }, taskService: {} });
    expect(calls.handled).toEqual([{ topic: 'without-options', task: { id: '2' } }]);
    expect(calls.intercepted).toBe(1);
  });

  it('should reject when the handler fails so the client emits handler:error', async () => {
    const errorSpy = vi.spyOn(Logger, 'error').mockImplementation(() => undefined);
    await expect(
      subscriptions()['failing'].handler({ task: { id: '3' }, taskService: {} }),
    ).rejects.toEqual({ status: 'error', message: 'Internal server error' });
    errorSpy.mockRestore();
  });

  it('should fall back to the raw key when there are no extras and no topic', () => {
    expect(
      camundaTaskConnector['resolveSubscription']('{"foo":1}', (() => undefined) as any),
    ).toEqual({ topic: '{"foo":1}', options: null });
  });

  it('should stop the client and log message when close is called', () => {
    const stopSpy = vi.spyOn(camundaTaskConnector['client'], 'stop');
    const logSpy = vi.spyOn(Logger, 'log');

    camundaTaskConnector.close();

    expect(stopSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith('External Task Client stopped', CamundaTaskConnector.name);

    stopSpy.mockRestore();
    logSpy.mockRestore();
  });

  it('should log the registered event', () => {
    const logSpy = vi.spyOn(Logger, 'log');

    camundaTaskConnector.on('test-event', vi.fn());

    expect(logSpy).toHaveBeenCalledWith('Registered event: test-event', CamundaTaskConnector.name);

    logSpy.mockRestore();
  });

  it('should return the underlying client', () => {
    expect(camundaTaskConnector.unwrap()).toBe(camundaTaskConnector['client']);
  });
});

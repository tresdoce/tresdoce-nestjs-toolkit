import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CamundaModule } from '../camunda/camunda.module';
import { dynamicConfig, tcName, testContainers } from '@tresdoce-nestjs-toolkit/test-utils';
import { Subscription } from '../camunda/decorators/camunda.decorator';
import { CamundaTaskConnector } from '../camunda/providers/camunda.provider';

describe('CamundaModule', () => {
  let app: INestApplication;
  let container: testContainers;
  let camundaTaskConnector: CamundaTaskConnector;

  beforeAll(async () => {
    container = await new testContainers('camunda/camunda-bpm-platform:7.17.0', {
      ports: [
        {
          container: 8080,
          host: 8080,
        },
      ],
      containerName: `${tcName}-camunda-bpm`,
      reuse: true,
    });
    await container.start();
  });

  afterAll(async () => {
    await container.stop({ removeVolumes: true });
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        await ConfigModule.forRoot({
          isGlobal: true,
          load: [
            dynamicConfig({
              camunda: {
                baseUrl: 'http://localhost:8080/engine-rest',
              },
            }),
          ],
        }),
        CamundaModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.connectMicroservice({
      strategy: app.get(CamundaTaskConnector),
    });
    camundaTaskConnector = app.get(CamundaTaskConnector);

    await app.startAllMicroservices();
    await app.init();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('should be Subscription decorator is defined with options', async () => {
    const decorator = Subscription('test-topic', { lockDuration: 500 });
    expect(decorator).toBeDefined();
  });

  it('should stop the client and log message when close is called', () => {
    const stopSpy = jest.spyOn(camundaTaskConnector['client'], 'stop');
    const logSpy = jest.spyOn(Logger, 'log');

    camundaTaskConnector.close();

    expect(stopSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith('External Task Client stopped', CamundaTaskConnector.name);

    stopSpy.mockRestore();
    logSpy.mockRestore();
  });

  it('should start the client, log a message, and subscribe handlers on init', () => {
    const startSpy = jest.spyOn(camundaTaskConnector['client'], 'start');
    const logSpy = jest.spyOn(Logger, 'log');
    const subscribeSpy = jest.spyOn(camundaTaskConnector['client'], 'subscribe');

    const handlers = new Map();
    handlers.set(
      JSON.stringify({ topic: 'test-topic', options: { lockDuration: 500 } }),
      jest.fn(),
    );
    jest.spyOn(camundaTaskConnector, 'getHandlers').mockReturnValue(handlers);

    camundaTaskConnector['init']();

    expect(startSpy).toHaveBeenCalled();

    expect(logSpy).toHaveBeenCalledWith('External Task Client started', CamundaTaskConnector.name);

    expect(subscribeSpy).toHaveBeenCalledWith(
      'test-topic',
      { lockDuration: 500 },
      expect.any(Function),
    );

    startSpy.mockRestore();
    logSpy.mockRestore();
    subscribeSpy.mockRestore();
  });

  it('should log the registered event', () => {
    const logSpy = jest.spyOn(Logger, 'log');

    camundaTaskConnector.on('test-event', jest.fn());

    expect(logSpy).toHaveBeenCalledWith('Registered event: test-event', CamundaTaskConnector.name);

    logSpy.mockRestore();
  });

  it('should return the underlying client', () => {
    const client = camundaTaskConnector.unwrap();

    expect(client).toBe(camundaTaskConnector['client']);
  });
});

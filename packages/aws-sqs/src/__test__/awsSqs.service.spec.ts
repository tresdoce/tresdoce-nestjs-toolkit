import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { config } from '@tresdoce-nestjs-toolkit/test-utils';

import { AwsSqsModule, AwsSqsService } from '..';

describe('AwsSqsService', () => {
  let service: AwsSqsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        AwsSqsModule,
      ],
      providers: [AwsSqsService],
    }).compile();

    service = module.get<AwsSqsService>(AwsSqsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be return message when call the getHello function', () => {
    expect(service.getHello()).toBe(`¡Hello ${config().project.name} from the new module aws-sqs!`);
  });
});

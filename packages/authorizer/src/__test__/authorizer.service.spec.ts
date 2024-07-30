import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizerService } from '../authorizer/services/authorizer.service';

describe('GreetingService', () => {
  let service: AuthorizerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorizerService],
    }).compile();

    service = module.get<AuthorizerService>(AuthorizerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});

import { Test, TestingModule } from '@nestjs/testing';
import { QrCodeService } from '../qr-code/services/qr-code.service';
import { QrCodeModule } from '../qr-code/qr-code.module';

describe('QrCodeModule', () => {
  let module: TestingModule;
  let qrCodeService: QrCodeService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [QrCodeModule],
    }).compile();

    qrCodeService = module.get<QrCodeService>(QrCodeService);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide QrCodeService', () => {
    expect(qrCodeService).toBeDefined();
    expect(qrCodeService).toBeInstanceOf(QrCodeService);
  });
});

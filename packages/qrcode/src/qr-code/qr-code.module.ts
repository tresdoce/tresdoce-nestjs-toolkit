import { Global, Module } from '@nestjs/common';
import { QrCodeService } from './services/qr-code.service.js';

@Global()
@Module({
  providers: [QrCodeService],
  exports: [QrCodeService],
})
export class QrCodeModule {}

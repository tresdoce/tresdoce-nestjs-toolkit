import { Global, Module } from '@nestjs/common';
import { FormatService } from './services/format.service';

@Global()
@Module({
  providers: [FormatService],
  exports: [FormatService],
})
export class FormatModule {}

import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { SkipTrace } from '@tresdoce-nestjs-toolkit/tracing';

@Controller('health')
export class LivenessController {
  @Get('liveness')
  @ApiExcludeEndpoint()
  @SkipTrace()
  getLiveness() {
    return { status: 'up' };
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class LivenessController {
  @Get('liveness')
  @ApiExcludeEndpoint()
  getLiveness() {
    return { status: 'up' };
  }
}

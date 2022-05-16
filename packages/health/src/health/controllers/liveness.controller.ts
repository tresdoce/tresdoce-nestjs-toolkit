import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('health')
export class LivenessController {
  @Get('liveness')
  //@ApiExcludeEndpoint()
  getLiveness() {
    return { status: 'up' };
  }
}

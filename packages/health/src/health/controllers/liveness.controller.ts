import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class LivenessController {
  @Get('liveness')
  getLiveness() {
    return { status: 'up' };
  }
}

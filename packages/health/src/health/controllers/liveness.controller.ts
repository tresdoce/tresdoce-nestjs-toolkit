import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('health')
export class LivenessController {
  @Get('live')
  @ApiExcludeEndpoint()
  getLiveness() {
    return { status: 'up' };
  }
}

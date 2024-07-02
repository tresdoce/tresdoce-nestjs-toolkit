import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipTrace } from '@tresdoce-nestjs-toolkit/tracing';

import { LivenessResponse } from '../entities/liveness.entity';
import { Public } from '@tresdoce-nestjs-toolkit/core';

@Controller('health')
export class LivenessController {
  @Get('liveness')
  @Public()
  @SkipTrace()
  @ApiTags('Monitoring')
  @ApiOperation({
    summary: 'Liveness check',
    description:
      'This endpoint returns the liveness status of the service. It is used to check if the service is alive.',
    operationId: 'checkLiveness',
  })
  @ApiResponse({
    status: 200,
    description: 'The service is live.',
    type: LivenessResponse,
    schema: {
      example: {
        status: 'up',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  getLiveness() {
    return { status: 'up' };
  }
}

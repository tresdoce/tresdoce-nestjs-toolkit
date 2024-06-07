import { ApiProperty } from '@nestjs/swagger';

export class LivenessResponse {
  @ApiProperty({ example: 'up', description: 'The status of the service' })
  status: string;
}

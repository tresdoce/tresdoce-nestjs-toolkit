var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipTrace } from '@tresdoce-nestjs-toolkit/tracing';
import { LivenessResponse } from '../entities/liveness.entity';
import { Public } from '@tresdoce-nestjs-toolkit/core';
let LivenessController = class LivenessController {
    getLiveness() {
        return { status: 'up' };
    }
};
__decorate([
    Get('liveness'),
    Public(),
    SkipTrace(),
    ApiOperation({
        summary: 'Liveness check',
        description: 'This endpoint returns the liveness status of the service. It is used to check if the service is alive.',
        operationId: 'checkLiveness',
    }),
    ApiResponse({
        status: 200,
        description: 'The service is live.',
        type: LivenessResponse,
        schema: {
            example: {
                status: 'up',
            },
        },
    }),
    ApiResponse({
        status: 500,
        description: 'Internal server error.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LivenessController.prototype, "getLiveness", null);
LivenessController = __decorate([
    Controller('health'),
    ApiTags('Monitoring')
], LivenessController);
export { LivenessController };

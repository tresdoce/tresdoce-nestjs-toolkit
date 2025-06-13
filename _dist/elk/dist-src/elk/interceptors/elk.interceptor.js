var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { tap } from 'rxjs';
import { ElkService } from '../services/elk.service';
let ElkInterceptor = class ElkInterceptor {
    constructor(elkService) {
        this.elkService = elkService;
    }
    intercept(_context, _next) {
        const timeRequest = Date.now();
        this.ctx = _context.switchToHttp();
        this.request = this.ctx.getRequest();
        this.response = this.ctx.getResponse();
        return _next.handle().pipe(tap({
            next: async (_response) => {
                await this.elkService.serializeResponseInterceptor(timeRequest, _context, _response, false);
            },
            error: async (_error) => {
                await this.elkService.serializeResponseInterceptor(timeRequest, _context, _error, true);
            },
        }));
    }
};
ElkInterceptor = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ElkService])
], ElkInterceptor);
export { ElkInterceptor };

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, Scope } from '@nestjs/common';
import { HttpClientService } from '../services/httpClient.service';
let HttpClientInterceptor = class HttpClientInterceptor {
    constructor(httpService) {
        this.httpService = httpService;
    }
    intercept(_context, _next) {
        const ctx = _context.switchToHttp();
        const request = ctx.getRequest();
        this.httpService.initAxios(request);
        return _next.handle();
    }
};
HttpClientInterceptor = __decorate([
    Injectable({ scope: Scope.REQUEST }),
    __metadata("design:paramtypes", [HttpClientService])
], HttpClientInterceptor);
export { HttpClientInterceptor };

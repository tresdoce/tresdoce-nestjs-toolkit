var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Inject, Injectable } from '@nestjs/common';
import { REDACT_PROVIDER } from '../constants/redact.constant';
let RedactService = class RedactService {
    constructor(redact) {
        this.redact = redact;
    }
    get redactRef() {
        /* istanbul ignore next */
        return this.redact ? this.redact : null;
    }
    /*
     * Obfuscate data
     */
    obfuscate(_data, _serialize = true) {
        const tempData = JSON.parse(JSON.stringify(_data));
        const dataRedacted = this.redactRef(tempData);
        return _serialize ? dataRedacted : JSON.stringify(dataRedacted);
    }
};
RedactService = __decorate([
    Injectable(),
    __param(0, Inject(REDACT_PROVIDER)),
    __metadata("design:paramtypes", [Object])
], RedactService);
export { RedactService };

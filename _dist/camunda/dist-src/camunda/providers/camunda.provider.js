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
var CamundaTaskConnector_1;
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Server } from '@nestjs/microservices';
import { Client } from 'camunda-external-task-client-js';
import { CONFIG_MODULE_OPTIONS } from '../constants/camunda.constants';
let CamundaTaskConnector = CamundaTaskConnector_1 = class CamundaTaskConnector extends Server {
    constructor(clientConfig) {
        super();
        this.clientConfig = clientConfig;
        this.client = new Client(this.clientConfig);
    }
    async listen(callback) {
        this.init();
        callback();
    }
    close() {
        this.client.stop();
        Logger.log('External Task Client stopped', CamundaTaskConnector_1.name);
    }
    init() {
        this.client.start();
        Logger.log('External Task Client started', CamundaTaskConnector_1.name);
        const handlers = this.getHandlers();
        handlers.forEach((messageHandler, key) => {
            const { topic, options } = JSON.parse(key);
            /* istanbul ignore next */
            this.client.subscribe(topic, options, async ({ task, taskService }) => {
                await messageHandler(task, taskService);
            });
        });
    }
    on(event, callback) {
        Logger.log(`Registered event: ${event}`, CamundaTaskConnector_1.name);
    }
    unwrap() {
        return this.client;
    }
};
CamundaTaskConnector = CamundaTaskConnector_1 = __decorate([
    Injectable(),
    __param(0, Inject(CONFIG_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], CamundaTaskConnector);
export { CamundaTaskConnector };

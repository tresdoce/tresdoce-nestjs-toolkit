'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common = require('@nestjs/common');
var config = require('@nestjs/config');
var microservices = require('@nestjs/microservices');
var camundaExternalTaskClientJs = require('camunda-external-task-client-js');

const CONFIG_MODULE_OPTIONS = Symbol('CONFIG_MODULE_OPTIONS');

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = undefined && undefined.__metadata || function (k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = undefined && undefined.__param || function (paramIndex, decorator) {
  return function (target, key) {
    decorator(target, key, paramIndex);
  };
};
var CamundaTaskConnector_1;
exports.CamundaTaskConnector = CamundaTaskConnector_1 = class CamundaTaskConnector extends microservices.Server {
  constructor(clientConfig) {
    super();
    this.clientConfig = clientConfig;
    this.client = new camundaExternalTaskClientJs.Client(this.clientConfig);
  }
  async listen(callback) {
    this.init();
    callback();
  }
  close() {
    this.client.stop();
    common.Logger.log('External Task Client stopped', CamundaTaskConnector_1.name);
  }
  init() {
    this.client.start();
    common.Logger.log('External Task Client started', CamundaTaskConnector_1.name);
    const handlers = this.getHandlers();
    handlers.forEach((messageHandler, key) => {
      const {
        topic,
        options
      } = JSON.parse(key);
      /* istanbul ignore next */
      this.client.subscribe(topic, options, async ({
        task,
        taskService
      }) => {
        await messageHandler(task, taskService);
      });
    });
  }
  on(event, callback) {
    common.Logger.log(`Registered event: ${event}`, CamundaTaskConnector_1.name);
  }
  unwrap() {
    return this.client;
  }
};
exports.CamundaTaskConnector = CamundaTaskConnector_1 = __decorate([common.Injectable(), __param(0, common.Inject(CONFIG_MODULE_OPTIONS)), __metadata("design:paramtypes", [Object])], exports.CamundaTaskConnector);

var __decorate$1 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.CamundaModule = class CamundaModule {};
exports.CamundaModule = __decorate$1([common.Global(), common.Module({
  imports: [config.ConfigModule],
  providers: [exports.CamundaTaskConnector, {
    provide: CONFIG_MODULE_OPTIONS,
    useFactory: async configService => configService.get('config.camunda'),
    inject: [config.ConfigService]
  }],
  exports: []
})], exports.CamundaModule);

const Subscription = (topic, options) => {
  /* istanbul ignore next */
  return (...args) => {
    const messagePattern = microservices.MessagePattern({
      topic,
      options: options || null
    });
    messagePattern(...args);
  };
};

Object.defineProperty(exports, 'BasicAuthInterceptor', {
    enumerable: true,
    get: function () {
        return camundaExternalTaskClientJs.BasicAuthInterceptor;
    }
});
Object.defineProperty(exports, 'Client', {
    enumerable: true,
    get: function () {
        return camundaExternalTaskClientJs.Client;
    }
});
Object.defineProperty(exports, 'Variables', {
    enumerable: true,
    get: function () {
        return camundaExternalTaskClientJs.Variables;
    }
});
Object.defineProperty(exports, 'logger', {
    enumerable: true,
    get: function () {
        return camundaExternalTaskClientJs.logger;
    }
});
exports.Subscription = Subscription;
//# sourceMappingURL=index.js.map

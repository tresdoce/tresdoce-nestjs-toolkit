'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common = require('@nestjs/common');
var dynamoose = require('dynamoose');
var config = require('@nestjs/config');

const getModelToken = model => `${model}Model`;

const InjectModel = model => common.Inject(getModelToken(model));

/* istanbul ignore file */
class TransactionSupport {
  transaction(transactions, settings, callback) {
    /* istanbul ignore next */
    return dynamoose.transaction(transactions, settings, callback);
  }
}

class LoggerProvider {
  constructor(logger) {
    this.logger = logger;
  }
  /* istanbul ignore next */
  log(message) {
    let method;
    switch (message.level) {
      case 'fatal':
      case 'error':
        method = this.logger.error;
        break;
      case 'warn':
        method = this.logger.warn;
        break;
      case 'info':
        method = this.logger.log;
        break;
      case 'debug':
      case 'trace':
        method = this.logger.log;
        break;
    }
    method.bind(this.logger)(message.category ? `${message.category} - ${message.message}` : message.message);
  }
}

const DYNAMOOSE_OPTIONS = Symbol('DYNAMOOSE_OPTIONS');
const DYNAMOOSE_MODULE_OPTIONS = Symbol('DYNAMOOSE_MODULE_OPTIONS');
const DYNAMOOSE_INITIALIZATION = Symbol('DYNAMOOSE_INITIALIZATION');

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DynamooseCoreModule_1;
async function initialization(options) {
  if (options.ddb) {
    dynamoose.aws.ddb.set(options.ddb);
  } else if (options.aws) {
    dynamoose.aws.ddb.set(new dynamoose.aws.ddb.DynamoDB(options.aws));
  }
  if (options.local) {
    if (typeof options.local === 'boolean') {
      dynamoose.aws.ddb.local();
    } else {
      dynamoose.aws.ddb.local(options.local);
    }
  }
  if (options.table) {
    dynamoose.Table.defaults.set(options.table);
  }
  /* istanbul ignore next */
  if (options.logger) {
    (await dynamoose.logger()).providers.add(new LoggerProvider(typeof options.logger === 'boolean' ? new common.Logger(exports.DynamooseModule.name) : options.logger));
  }
}
let DynamooseCoreModule = DynamooseCoreModule_1 = class DynamooseCoreModule {
  /* istanbul ignore next */
  static forRoot(options = {}) {
    const initialProvider = {
      provide: DYNAMOOSE_INITIALIZATION,
      useFactory: () => initialization(options)
    };
    return {
      module: DynamooseCoreModule_1,
      providers: [initialProvider],
      exports: [initialProvider]
    };
  }
  static forRootAsync(options) {
    const initialProvider = {
      provide: DYNAMOOSE_INITIALIZATION,
      useFactory: dynamoooseModuleOptions => initialization(dynamoooseModuleOptions),
      inject: [DYNAMOOSE_MODULE_OPTIONS]
    };
    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: DynamooseCoreModule_1,
      imports: options.imports,
      providers: [...asyncProviders, initialProvider],
      exports: [initialProvider]
    };
  }
  static createAsyncProviders(options) {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    /* istanbul ignore next */
    //const useClass = options.useClass as Type<DynamooseOptionsFactory>;
    const useClass = options.useClass;
    /* istanbul ignore next */
    return [this.createAsyncOptionsProvider(options), {
      provide: useClass,
      useClass
    }];
  }
  static createAsyncOptionsProvider(options) {
    if (options.useFactory) {
      return {
        provide: DYNAMOOSE_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || []
      };
    }
    /* istanbul ignore next */
    //const inject = [(options.useClass || options.useExisting) as Type<DynamooseOptionsFactory>];
    const inject = [options.useClass || options.useExisting];
    /* istanbul ignore next */
    return {
      provide: DYNAMOOSE_MODULE_OPTIONS,
      useFactory: async optionsFactory => await optionsFactory.createDynamooseOptions(),
      inject
    };
  }
};
DynamooseCoreModule = DynamooseCoreModule_1 = __decorate([common.Global(), common.Module({})], DynamooseCoreModule);

const createDynamooseProviders = (models = []) => {
  return models.map(model => ({
    provide: getModelToken(model.name),
    useFactory: () => {
      const modelInstance = dynamoose.model(model.name, model.schema, model.options);
      if (model.serializers) {
        Object.entries(model.serializers).forEach(([key, value]) => {
          modelInstance.serializer.add(key, value);
        });
      }
      return modelInstance;
    },
    inject: [DYNAMOOSE_INITIALIZATION]
  }));
};
const createDynamooseAsyncProviders = (modelFactories = []) => {
  const providers = modelFactories.map(model => [{
    provide: getModelToken(model.name),
    useFactory: async (...args) => {
      var _modelDefinition, _modelDefinition2;
      const object = await model.useFactory(...args);
      let modelDefinition;
      let schema;
      if (object.hasOwnProperty('schema')) {
        modelDefinition = object;
        schema = modelDefinition.schema;
      } else {
        schema = object;
      }
      const options = ((_modelDefinition = modelDefinition) === null || _modelDefinition === void 0 ? void 0 : _modelDefinition.options) || model.options;
      const serializers = ((_modelDefinition2 = modelDefinition) === null || _modelDefinition2 === void 0 ? void 0 : _modelDefinition2.serializers) || model.serializers;
      const modelInstance = dynamoose.model(model.name, schema, options);
      if (serializers) {
        Object.entries(serializers).forEach(([key, value]) => {
          modelInstance.serializer.add(key, value);
        });
      }
      return modelInstance;
    },
    inject: [DYNAMOOSE_INITIALIZATION, ...(model.inject || [])]
  }]);
  return common.flatten(providers);
};

var __decorate$1 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DynamooseModule_1;
exports.DynamooseModule = DynamooseModule_1 = class DynamooseModule {
  static forRoot(options = {}) {
    return {
      module: DynamooseModule_1,
      imports: [DynamooseCoreModule.forRoot(options)]
    };
  }
  static forRootAsync(options) {
    return {
      module: DynamooseModule_1,
      imports: [DynamooseCoreModule.forRootAsync(options)]
    };
  }
  static forFeature(models = []) {
    const providers = createDynamooseProviders(models);
    return {
      module: DynamooseModule_1,
      providers: providers,
      exports: providers
    };
  }
  static forFeatureAsync(factories = []) {
    const providers = createDynamooseAsyncProviders(factories);
    const imports = factories.map(factory => factory.imports || []);
    const uniqImports = new Set(common.flatten(imports));
    return {
      module: DynamooseModule_1,
      imports: [...uniqImports],
      providers: providers,
      exports: providers
    };
  }
};
exports.DynamooseModule = DynamooseModule_1 = __decorate$1([common.Global(), common.Module({
  imports: [config.ConfigModule, DynamooseCoreModule.forRootAsync({
    useFactory: async options => options,
    inject: [DYNAMOOSE_OPTIONS]
  })],
  providers: [{
    provide: DYNAMOOSE_OPTIONS,
    useFactory: async configService => configService.get('config.dynamodb'),
    inject: [config.ConfigService]
  }],
  exports: [DynamooseCoreModule, DYNAMOOSE_OPTIONS]
})], exports.DynamooseModule);

exports.InjectModel = InjectModel;
exports.TransactionSupport = TransactionSupport;
exports.getModelToken = getModelToken;
//# sourceMappingURL=index.js.map

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DynamooseCoreModule_1;
import { Global, Logger, Module } from '@nestjs/common';
import { aws, logger, Table } from 'dynamoose';
import { DynamooseModule } from './dynamoose.module';
import { LoggerProvider } from './providers/dynamoose-logger.provider';
import { DYNAMOOSE_INITIALIZATION, DYNAMOOSE_MODULE_OPTIONS } from './constants/dynamoose.constant';
async function initialization(options) {
    if (options.ddb) {
        aws.ddb.set(options.ddb);
    }
    else if (options.aws) {
        aws.ddb.set(new aws.ddb.DynamoDB(options.aws));
    }
    if (options.local) {
        if (typeof options.local === 'boolean') {
            aws.ddb.local();
        }
        else {
            aws.ddb.local(options.local);
        }
    }
    if (options.table) {
        Table.defaults.set(options.table);
    }
    /* istanbul ignore next */
    if (options.logger) {
        (await logger()).providers.add(new LoggerProvider(typeof options.logger === 'boolean' ? new Logger(DynamooseModule.name) : options.logger));
    }
}
let DynamooseCoreModule = DynamooseCoreModule_1 = class DynamooseCoreModule {
    /* istanbul ignore next */
    static forRoot(options = {}) {
        const initialProvider = {
            provide: DYNAMOOSE_INITIALIZATION,
            useFactory: () => initialization(options),
        };
        return {
            module: DynamooseCoreModule_1,
            providers: [initialProvider],
            exports: [initialProvider],
        };
    }
    static forRootAsync(options) {
        const initialProvider = {
            provide: DYNAMOOSE_INITIALIZATION,
            useFactory: (dynamoooseModuleOptions) => initialization(dynamoooseModuleOptions),
            inject: [DYNAMOOSE_MODULE_OPTIONS],
        };
        const asyncProviders = this.createAsyncProviders(options);
        return {
            module: DynamooseCoreModule_1,
            imports: options.imports,
            providers: [...asyncProviders, initialProvider],
            exports: [initialProvider],
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
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: useClass,
                useClass,
            },
        ];
    }
    static createAsyncOptionsProvider(options) {
        if (options.useFactory) {
            return {
                provide: DYNAMOOSE_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        /* istanbul ignore next */
        //const inject = [(options.useClass || options.useExisting) as Type<DynamooseOptionsFactory>];
        const inject = [options.useClass || options.useExisting];
        /* istanbul ignore next */
        return {
            provide: DYNAMOOSE_MODULE_OPTIONS,
            useFactory: async (optionsFactory) => await optionsFactory.createDynamooseOptions(),
            inject,
        };
    }
};
DynamooseCoreModule = DynamooseCoreModule_1 = __decorate([
    Global(),
    Module({})
], DynamooseCoreModule);
export { DynamooseCoreModule };

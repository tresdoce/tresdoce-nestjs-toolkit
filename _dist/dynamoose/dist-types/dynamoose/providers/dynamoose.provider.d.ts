import { AsyncModelFactory, ModelDefinition } from '../interfaces';
import { ModelType } from 'dynamoose/dist/General';
export declare const createDynamooseProviders: (models?: ModelDefinition[]) => {
    provide: string;
    useFactory: () => any;
    inject: symbol[];
}[];
export declare const createDynamooseAsyncProviders: (modelFactories?: AsyncModelFactory[]) => {
    provide: string;
    useFactory: (...args: unknown[]) => Promise<ModelType<import("dynamoose/dist/Item").AnyItem>>;
    inject: any[];
}[];

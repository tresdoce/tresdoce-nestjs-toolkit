import { flatten } from '@nestjs/common';
import * as dynamoose from 'dynamoose';
import { getModelToken } from '../common/index';
import { DYNAMOOSE_INITIALIZATION } from '../constants/dynamoose.constant';
export const createDynamooseProviders = (models = []) => {
    return models.map((model) => ({
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
        inject: [DYNAMOOSE_INITIALIZATION],
    }));
};
export const createDynamooseAsyncProviders = (modelFactories = []) => {
    const providers = modelFactories.map((model) => [
        {
            provide: getModelToken(model.name),
            useFactory: async (...args) => {
                const object = await model.useFactory(...args);
                let modelDefinition;
                let schema;
                if (object.hasOwnProperty('schema')) {
                    modelDefinition = object;
                    schema = modelDefinition.schema;
                }
                else {
                    schema = object;
                }
                const options = modelDefinition?.options || model.options;
                const serializers = modelDefinition?.serializers || model.serializers;
                const modelInstance = dynamoose.model(model.name, schema, options);
                if (serializers) {
                    Object.entries(serializers).forEach(([key, value]) => {
                        modelInstance.serializer.add(key, value);
                    });
                }
                return modelInstance;
            },
            inject: [DYNAMOOSE_INITIALIZATION, ...(model.inject || [])],
        },
    ]);
    return flatten(providers);
};

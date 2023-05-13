import * as dynamoose from 'dynamoose';
import {
  createDynamooseAsyncProviders,
  createDynamooseProviders,
} from '../dynamoose/providers/dynamoose.provider';
import { getModelToken } from '../dynamoose/common/index';
import { AsyncModelFactory, ModelDefinition } from '../dynamoose/interfaces';
import { DYNAMOOSE_INITIALIZATION } from '../dynamoose/constants/dynamoose.constant';

jest.mock('dynamoose', () => ({
  model: jest.fn().mockImplementation((name, schema, options) => ({
    serializer: {
      add: jest.fn(),
    },
  })),
}));

describe('Providers', () => {
  describe('createDynamooseProviders', () => {
    it('should create providers with no models', () => {
      const providers = createDynamooseProviders();
      expect(providers).toEqual([]);
    });

    it('should create providers with no models array', () => {
      const providers = createDynamooseProviders([]);
      expect(providers).toEqual([]);
    });

    it('should create providers with models and no serializers', () => {
      const models: ModelDefinition[] = [
        {
          name: 'TestModel',
          schema: {
            id: String,
          },
          options: {},
        },
      ];

      const providers = createDynamooseProviders(models);
      const expectedProviders = [
        {
          provide: getModelToken(models[0].name),
          useFactory: expect.any(Function),
          inject: [DYNAMOOSE_INITIALIZATION],
        },
      ];

      expect(providers).toHaveLength(1);
      expect(providers).toEqual(expectedProviders);
      const modelInstance = providers[0].useFactory();

      expect(dynamoose.model).toHaveBeenCalledWith(
        models[0].name,
        models[0].schema,
        models[0].options,
      );
      expect(modelInstance.serializer.add).not.toHaveBeenCalled();
      expect(dynamoose.model).toHaveBeenCalledTimes(1);
    });

    it('should create providers with models and serializers', () => {
      const models: ModelDefinition[] = [
        {
          name: 'TestModel',
          schema: {
            id: String,
          },
          options: {},
          serializers: {
            test: {},
          },
        },
      ];

      const providers = createDynamooseProviders(models);
      const expectedProviders = [
        {
          provide: getModelToken(models[0].name),
          useFactory: expect.any(Function),
          inject: [DYNAMOOSE_INITIALIZATION],
        },
      ];

      expect(providers).toHaveLength(1);
      expect(providers).toEqual(expectedProviders);

      const modelInstance = providers[0].useFactory();
      expect(dynamoose.model).toHaveBeenCalledWith(
        models[0].name,
        models[0].schema,
        models[0].options,
      );
      expect(modelInstance.serializer.add).toHaveBeenCalledWith('test', models[0].serializers.test);
    });
  });

  describe('createDynamooseAsyncProviders', () => {
    it('should create async providers with no factories', () => {
      const providers = createDynamooseAsyncProviders();
      expect(providers).toEqual([]);
    });

    it('should create async providers with no factories array', () => {
      const providers = createDynamooseAsyncProviders([]);
      expect(providers).toEqual([]);
    });

    it('should return an empty array if no model factories are provided', async () => {
      const providers = createDynamooseAsyncProviders();
      const result = await Promise.all(
        providers.map((provider) => {
          return provider.useFactory(undefined, {});
        }),
      );

      expect(providers).toEqual([]);
      expect(result).toEqual([]);
    });

    it('should create async providers with factories returning schema', async () => {
      const modelFactories: AsyncModelFactory[] = [
        {
          name: 'TestModel',
          useFactory: jest.fn().mockReturnValue({
            id: String,
          }),
        },
      ];

      const providers = createDynamooseAsyncProviders(modelFactories);
      const expectedProviders = [
        {
          provide: getModelToken(modelFactories[0].name),
          useFactory: expect.any(Function),
          inject: [DYNAMOOSE_INITIALIZATION],
        },
      ];

      expect(providers).toHaveLength(1);
      expect(providers).toEqual(expectedProviders);

      const modelInstance = await providers[0].useFactory();
      expect(dynamoose.model).toHaveBeenCalledWith(
        modelFactories[0].name,
        modelFactories[0].useFactory(),
        undefined,
      );
      expect(modelInstance.serializer.add).not.toHaveBeenCalled();
    });

    it('should create async providers with factories returning ModelDefinition', async () => {
      const modelFactories: AsyncModelFactory[] = [
        {
          name: 'TestModel',
          useFactory: jest.fn().mockReturnValue({
            schema: {
              id: String,
            },
            options: { create: false },
            serializers: { test: {} },
          }),
        },
      ];

      const providers = createDynamooseAsyncProviders(modelFactories);
      const expectedProviders = [
        {
          provide: getModelToken(modelFactories[0].name),
          useFactory: expect.any(Function),
          inject: [DYNAMOOSE_INITIALIZATION],
        },
      ];

      expect(providers).toHaveLength(1);
      expect(providers).toEqual(expectedProviders);

      const modelInstance = await providers[0].useFactory();
      expect(dynamoose.model).toHaveBeenCalledWith(
        modelFactories[0].name,
        {
          id: String,
        },
        { create: false },
      );
      expect(modelInstance.serializer.add).toHaveBeenCalledWith('test', {});
    });
  });
});

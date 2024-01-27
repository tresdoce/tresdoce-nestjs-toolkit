import { FilteringParams, Filtering, FilterRule } from '../decorators';
import { BadRequestException } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

describe('Filtering Decorator', () => {
  function getParamDecoratorFactory(decorator: Function) {
    class Test {
      @decorator()
      public test(filteringParams: Filtering<any>[]) {}
      //public test(@decorator() filteringParams: Filtering<any>[]) {}
    }

    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
    return args[Object.keys(args)[0]].factory;
  }

  it('should return empty array if no filter query params are provided', () => {
    const factory = getParamDecoratorFactory(FilteringParams);
    const mockFiltering = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {},
        }),
      }),
    };
    const result = factory(['age', 'name'], mockFiltering);
    expect(result).toBeDefined();
    expect(result).toEqual([]);
  });

  it('should return the correct fields, rules, and values from query params', () => {
    const filter = 'age:gte:30,name:like:John';
    const factory = getParamDecoratorFactory(FilteringParams);
    const mockFiltering = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            filter,
          },
        }),
      }),
    };
    const result = factory(['age', 'name'], mockFiltering);
    expect(result).toEqual([
      { property: 'age', rule: FilterRule.GREATER_THAN_OR_EQUALS, values: [30] },
      { property: 'name', rule: FilterRule.LIKE, values: ['John'] },
    ]);
  });

  it('should properly handle the filter rule EQUALS', () => {
    const filter = 'property:eq:value';
    const factory = getParamDecoratorFactory(FilteringParams);
    const mockFiltering = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: { filter },
        }),
      }),
    };
    const result = factory(['property'], mockFiltering);
    expect(result).toEqual([{ property: 'property', rule: FilterRule.EQUALS, values: ['value'] }]);
  });

  it('should properly handle the filter rule NOT_EQUALS', () => {
    const filter = 'property:neq:value';
    const factory = getParamDecoratorFactory(FilteringParams);
    const mockFiltering = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: { filter },
        }),
      }),
    };
    const result = factory(['property'], mockFiltering);
    expect(result).toEqual([
      { property: 'property', rule: FilterRule.NOT_EQUALS, values: ['value'] },
    ]);
  });

  it('should properly handle the filter rule GREATER_THAN', () => {
    const filter = 'property:gt:100';
    const factory = getParamDecoratorFactory(FilteringParams);
    const mockFiltering = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: { filter },
        }),
      }),
    };
    const result = factory(['property'], mockFiltering);
    expect(result).toEqual([
      { property: 'property', rule: FilterRule.GREATER_THAN, values: [100] },
    ]);
  });

  it('should properly handle the filter rule GREATER_THAN_OR_EQUALS', () => {
    const filter = 'property:gte:100';
    const factory = getParamDecoratorFactory(FilteringParams);
    const mockFiltering = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: { filter },
        }),
      }),
    };
    const result = factory(['property'], mockFiltering);
    expect(result).toEqual([
      { property: 'property', rule: FilterRule.GREATER_THAN_OR_EQUALS, values: [100] },
    ]);
  });

  it('should properly handle the filter rule LESS_THAN', () => {
    const filter = 'property:lt:50';
    const factory = getParamDecoratorFactory(FilteringParams);
    const mockFiltering = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: { filter },
        }),
      }),
    };
    const result = factory(['property'], mockFiltering);
    expect(result).toEqual([{ property: 'property', rule: FilterRule.LESS_THAN, values: [50] }]);
  });

  it('should properly handle the filter rule LESS_THAN_OR_EQUALS', () => {
    const filter = 'property:lte:50';
    const factory = getParamDecoratorFactory(FilteringParams);
    const mockFiltering = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: { filter },
        }),
      }),
    };
    const result = factory(['property'], mockFiltering);
    expect(result).toEqual([
      { property: 'property', rule: FilterRule.LESS_THAN_OR_EQUALS, values: [50] },
    ]);
  });

  it('should properly handle the filter rule LIKE', () => {
    const filter = 'property:like:value';
    const factory = getParamDecoratorFactory(FilteringParams);
    const mockFiltering = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: { filter },
        }),
      }),
    };
    const result = factory(['property'], mockFiltering);
    expect(result).toEqual([{ property: 'property', rule: FilterRule.LIKE, values: ['value'] }]);
  });

  it('should properly handle the filter rule NOT_LIKE', () => {
    const filter = 'property:nlike:value';
    const factory = getParamDecoratorFactory(FilteringParams);
    const mockFiltering = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: { filter },
        }),
      }),
    };
    const result = factory(['property'], mockFiltering);
    expect(result).toEqual([
      { property: 'property', rule: FilterRule.NOT_LIKE, values: ['value'] },
    ]);
  });

  it('should properly handle the filter rule IN', () => {
    const filter = 'property:in:value1,value2';
    const factory = getParamDecoratorFactory(FilteringParams);
    const mockFiltering = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: { filter },
        }),
      }),
    };
    const result = factory(['property'], mockFiltering);
    expect(result).toEqual([
      { property: 'property', rule: FilterRule.IN, values: ['value1', 'value2'] },
    ]);
  });

  it('should properly handle the filter rule NOT_IN', () => {
    const filter = 'property:nin:value1,value2';
    const factory = getParamDecoratorFactory(FilteringParams);
    const mockFiltering = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: { filter },
        }),
      }),
    };
    const result = factory(['property'], mockFiltering);
    expect(result).toEqual([
      { property: 'property', rule: FilterRule.NOT_IN, values: ['value1', 'value2'] },
    ]);
  });

  it('should properly handle the filter rule IS_NULL', () => {
    const filter = 'property:isnull';
    const factory = getParamDecoratorFactory(FilteringParams);
    const mockFiltering = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: { filter },
        }),
      }),
    };
    const result = factory(['property'], mockFiltering);
    expect(result).toEqual([{ property: 'property', rule: FilterRule.IS_NULL, values: [] }]);
  });

  it('should properly handle the filter rule IS_NOT_NULL', () => {
    const filter = 'property:isnotnull';
    const factory = getParamDecoratorFactory(FilteringParams);
    const mockFiltering = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: { filter },
        }),
      }),
    };
    const result = factory(['property'], mockFiltering);
    expect(result).toEqual([{ property: 'property', rule: FilterRule.IS_NOT_NULL, values: [] }]);
  });

  it('should throw BadRequestException if filter parameter format is invalid', () => {
    const filter = 'invalid_format';
    const factory = getParamDecoratorFactory(FilteringParams);
    const mockFiltering = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            filter,
          },
        }),
      }),
    };
    expect(() => {
      factory(['age', 'name'], mockFiltering as any);
    }).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if property is not included in validProperties', () => {
    const filter = 'invalid_property:eq:value';
    const factory = getParamDecoratorFactory(FilteringParams);
    const mockFiltering = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            filter,
          },
        }),
      }),
    };
    expect(() => {
      factory(['age', 'name'], mockFiltering as any);
    }).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if validProperties is not an array', () => {
    const filter = 'age:eq:30';
    const factory = getParamDecoratorFactory(FilteringParams);
    const mockFiltering = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            filter,
          },
        }),
      }),
    };
    expect(() => {
      factory('not_an_array', mockFiltering as any);
    }).toThrow(BadRequestException);
    expect(() => {
      factory('not_an_array', mockFiltering as any);
    }).toThrowError('Invalid filter configuration');
  });

  it('should throw BadRequestException if filter parameter is in incorrect format', () => {
    const filter = 'ageeq30';
    const factory = getParamDecoratorFactory(FilteringParams);
    const mockFiltering = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            filter,
          },
        }),
      }),
    };
    expect(() => {
      factory(['age', 'name'], mockFiltering as any);
    }).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if filter rule is not a valid FilterRule', () => {
    const filter = 'age:invalid_rule:value';
    const factory = getParamDecoratorFactory(FilteringParams);
    const mockFiltering = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            filter,
          },
        }),
      }),
    };
    expect(() => {
      factory(['age', 'name'], mockFiltering as any);
    }).toThrow(BadRequestException);
  });
});

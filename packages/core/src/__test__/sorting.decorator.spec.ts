import { Sorting, SortingParams } from '../decorators';
import { BadRequestException } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

describe('Sorting Decorator', () => {
  function getParamDecoratorFactory(decorator: Function) {
    class Test {
      @decorator()
      public test(sortingParams: SortingParams) {}
      //public test(@decorator() sortingParams: SortingParams) {}
    }

    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
    return args[Object.keys(args)[0]].factory;
  }

  it('should return empty array if no sort query params are provided', () => {
    const factory = getParamDecoratorFactory(Sorting);
    const mockSorting = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {},
        }),
      }),
    };
    const result = factory(['user_id', 'first_name'], mockSorting);
    expect(result).toBeDefined();
    expect(result.fields).toEqual([]);
  });

  it('should return the correct fields and order from query params', () => {
    const sort = 'user_id:asc,first_name:desc';
    const factory = getParamDecoratorFactory(Sorting);
    const mockSorting = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            sort,
          },
        }),
      }),
    };
    const result = factory(['user_id', 'first_name'], mockSorting);
    expect(result.fields).toEqual([
      { field: 'user_id', order: 'asc' },
      { field: 'first_name', order: 'desc' },
    ]);
  });

  it('should throw BadRequestException if sort parameter format is invalid', () => {
    const sort = 'invalid_format';
    const factory = getParamDecoratorFactory(Sorting);
    const mockSorting = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            sort,
          },
        }),
      }),
    };
    expect(() => {
      factory(['user_id', 'first_name'], mockSorting as any);
    }).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if field is not included in validParams', () => {
    const sort = 'invalid_field:asc';
    const factory = getParamDecoratorFactory(Sorting);
    const mockSorting = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            sort,
          },
        }),
      }),
    };
    expect(() => {
      factory(['user_id', 'first_name'], mockSorting as any);
    }).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if validParams is not an array', () => {
    const sort = 'user_id:asc';
    const factory = getParamDecoratorFactory(Sorting);
    const mockSorting = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            sort,
          },
        }),
      }),
    };
    expect(() => {
      factory('not_an_array', mockSorting as any);
    }).toThrow(BadRequestException);
    expect(() => {
      factory('not_an_array', mockSorting as any);
    }).toThrowError('Invalid configuration for sorting parameters');
  });

  it('should throw BadRequestException if sort parameter is in incorrect format', () => {
    const sort = 'user_idasc';
    const factory = getParamDecoratorFactory(Sorting);
    const mockSorting = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            sort,
          },
        }),
      }),
    };
    expect(() => {
      factory(['user_id', 'first_name'], mockSorting as any);
    }).toThrow(BadRequestException);
    /*expect(() => {
      factory(['user_id', 'first_name'], mockSorting as any);
    }).toThrowError(
      `Invalid sort parameter: "user_idasc". It must be in the format 'field_name[:direction]' where direction is 'asc' or 'desc' and is optional.`,
    );*/
  });

  it('should throw BadRequestException if sort direction is not "asc" or "desc"', () => {
    const sort = 'user_id:ascending';
    const factory = getParamDecoratorFactory(Sorting);
    const mockSorting = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            sort,
          },
        }),
      }),
    };
    expect(() => {
      factory(['user_id', 'first_name'], mockSorting as any);
    }).toThrow(BadRequestException);
    expect(() => {
      factory(['user_id', 'first_name'], mockSorting as any);
    }).toThrowError(
      `Invalid sort parameter: "user_id:ascending". It must be in the format 'field_name[:direction]' where direction is 'asc' or 'desc' and is optional.`,
    );
  });
});

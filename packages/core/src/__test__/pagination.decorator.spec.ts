import { Pagination, PaginationParams } from '../decorators';
import { BadRequestException } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { DEFAULT_SIZE, DEFAULT_PAGE } from '../decorators/constants/pagination.constant';

describe('Pagination Decorator', () => {
  function getParamDecoratorFactory(decorator: Function) {
    class Test {
      public test(@decorator() paginationParams: PaginationParams) {}
    }

    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
    return args[Object.keys(args)[0]].factory;
  }

  it('should return default page and size if no query params are provided', () => {
    const factory = getParamDecoratorFactory(Pagination);
    const mockPagination = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {}, // No se proporcionan parámetros
        }),
      }),
    };
    const result = factory(null, mockPagination);
    expect(result).toBeDefined();
    expect(result.page).toBe(DEFAULT_PAGE);
    expect(result.size).toBe(DEFAULT_SIZE);
  });

  it('should return the correct page and size from query params', () => {
    const page: number = 2;
    const size: number = 20;
    const factory = getParamDecoratorFactory(Pagination);
    const mockPagination = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            page,
            size,
          },
        }),
      }),
    };
    const result = factory(null, mockPagination);
    expect(result.page).toBe(page);
    expect(result.size).toBe(size);
  });

  it('should throw BadRequestException if page is not a positive integer', () => {
    const page: number = -2;
    const size: number = 10;
    const factory = getParamDecoratorFactory(Pagination);
    const mockPagination = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            page,
            size,
          },
        }),
      }),
    };
    expect(() => {
      factory(null, mockPagination as any);
    }).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if size is not a positive integer', () => {
    const page: number = 2;
    const size: number = -10;
    const factory = getParamDecoratorFactory(Pagination);
    const mockPagination = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            page,
            size,
          },
        }),
      }),
    };
    expect(() => {
      factory(null, mockPagination as any);
    }).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if page is a string', () => {
    const page: string = 'invalid';
    const size: number = 10;
    const factory = getParamDecoratorFactory(Pagination);
    const mockPagination = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            page,
            size,
          },
        }),
      }),
    };
    expect(() => {
      factory(null, mockPagination as any);
    }).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if size is a string', () => {
    const page: number = 2;
    const size: string = 'invalid';
    const factory = getParamDecoratorFactory(Pagination);
    const mockPagination = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            page,
            size,
          },
        }),
      }),
    };
    expect(() => {
      factory(null, mockPagination as any);
    }).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if size exceeds the maximum value', () => {
    const page: number = 2;
    const size: number = 200;
    const factory = getParamDecoratorFactory(Pagination);
    const mockPagination = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            page,
            size,
          },
        }),
      }),
    };
    expect(() => {
      factory(null, mockPagination as any);
    }).toThrow(BadRequestException);
  });
});

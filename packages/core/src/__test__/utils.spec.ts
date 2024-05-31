import { calculatePagination, getSkipHealthChecks } from '../utils';
import { TSkipHealthChecks } from '../typings';

describe('Utils', () => {
  describe('getSkipHealthChecks', () => {
    it('should return an array of values when _value is not empty', () => {
      const result: TSkipHealthChecks[] = getSkipHealthChecks(
        'storage,memory,elasticsearch,camunda,redis,typeorm',
      );
      expect(result).toEqual(['storage', 'memory', 'elasticsearch', 'camunda', 'redis', 'typeorm']);
    });

    it('should handle spaces and different cases', () => {
      const result: TSkipHealthChecks[] = getSkipHealthChecks(
        ' Storage ,MEMORY , elasticsearch , camUnda , redis , typeORM',
      );
      expect(result).toEqual(['storage', 'memory', 'elasticsearch', 'camunda', 'redis', 'typeorm']);
    });

    it('should return an empty array when _value is empty', () => {
      const result: TSkipHealthChecks[] = getSkipHealthChecks('');
      expect(result).toEqual([]);
    });

    it('should return an empty array when _value is undefined', () => {
      const result: TSkipHealthChecks[] = getSkipHealthChecks(undefined as any);
      expect(result).toEqual([]);
    });
  });

  describe('calculatePagination', () => {
    it('should calculate pagination metadata when there is a next and previous page', () => {
      const params = {
        total: 100,
        page: 2,
        size: 10,
      };

      const result = calculatePagination(params);

      expect(result.page).toEqual(2);
      expect(result.size).toEqual(10);
      expect(result.total).toEqual(100);
      expect(result.totalPages).toEqual(10);
      expect(result.hasNext).toEqual(true);
      expect(result.hasPrevious).toEqual(true);
    });

    it('should calculate pagination metadata when there is no next page', () => {
      const params = {
        total: 30,
        page: 3,
        size: 10,
      };

      const result = calculatePagination(params);

      expect(result.page).toEqual(3);
      expect(result.size).toEqual(10);
      expect(result.total).toEqual(30);
      expect(result.totalPages).toEqual(3);
      expect(result.hasNext).toEqual(false);
      expect(result.hasPrevious).toEqual(true);
    });

    it('should calculate pagination metadata when there is no previous page', () => {
      const params = {
        total: 50,
        page: 1,
        size: 10,
      };

      const result = calculatePagination(params);

      expect(result.page).toEqual(1);
      expect(result.size).toEqual(10);
      expect(result.total).toEqual(50);
      expect(result.totalPages).toEqual(5);
      expect(result.hasNext).toEqual(true);
      expect(result.hasPrevious).toEqual(false);
    });

    it('should calculate pagination metadata when there is only one page', () => {
      const params = {
        total: 5,
        page: 1,
        size: 10,
      };

      const result = calculatePagination(params);

      expect(result.page).toEqual(1);
      expect(result.size).toEqual(10);
      expect(result.total).toEqual(5);
      expect(result.totalPages).toEqual(1);
      expect(result.hasNext).toEqual(false);
      expect(result.hasPrevious).toEqual(false);
    });
  });
});

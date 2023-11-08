import { getSkipHealthChecks } from '../utils';
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
});

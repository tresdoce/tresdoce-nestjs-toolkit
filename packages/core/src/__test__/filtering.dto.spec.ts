import { FilteringParamsDto, FilteringCriteriaDto } from '../decorators';
import { validate } from '@nestjs/class-validator';
import { plainToClass } from '@nestjs/class-transformer';

describe('Filtering Dto', () => {
  describe('FilteringCriteriaDto', () => {
    it('should validate a valid FilteringCriteriaDto', async () => {
      const dto = plainToClass(FilteringCriteriaDto, {
        property: 'age',
        rule: 'gte',
        values: ['30'],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should not validate an invalid FilteringCriteriaDto with invalid rule', async () => {
      const dto = plainToClass(FilteringCriteriaDto, {
        property: 'age',
        rule: 'invalid_rule',
        values: ['30'],
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEnum', 'rule must be a valid enum value');
    });

    it('should validate a FilteringCriteriaDto with optional values for IS_NULL rule', async () => {
      const dto = plainToClass(FilteringCriteriaDto, {
        property: 'age',
        rule: 'isnull',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('FilteringParamsDto', () => {
    it('should validate a valid FilteringParamsDto', async () => {
      const filters = 'age:gt:30,name:like:John,status:in:active,inactive';
      const dto = plainToClass(FilteringParamsDto, {
        filters,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should not validate an invalid FilteringParamsDto with invalid rule', async () => {
      const filters = {
        property: 'age',
        rule: 'eq',
        value: ['30'],
      };

      const dto = plainToClass(FilteringParamsDto, {
        filters,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate an empty filters array', async () => {
      const filters = '';

      const dto = plainToClass(FilteringParamsDto, {
        filters,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});

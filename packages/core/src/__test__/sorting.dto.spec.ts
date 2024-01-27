import { SortingParamsDto, SortCriteriaDto } from '../decorators';
import { validate } from '@nestjs/class-validator';
import { plainToClass } from '@nestjs/class-transformer';

describe('Sorting Dto', () => {
  describe('SortCriteriaDto', () => {
    it('should validate a valid SortCriteriaDto', async () => {
      const dto = plainToClass(SortCriteriaDto, {
        field: 'user_id',
        order: 'asc',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should not validate an invalid SortCriteriaDto', async () => {
      const dto = plainToClass(SortCriteriaDto, {
        field: 'user_id',
        order: 'ascending',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty(
        'isIn',
        'order must be one of the following values: asc, desc',
      );
    });

    it('should set default order value if missing', async () => {
      const dto = plainToClass(SortCriteriaDto, {
        field: 'user_id',
      });

      expect(dto.order).toBe('asc');

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('SortingParamsDto', () => {
    it('should validate a valid SortingParamsDto', async () => {
      const dto = plainToClass(SortingParamsDto, {
        fields: [
          { field: 'user_id', order: 'asc' },
          { field: 'first_name', order: 'desc' },
        ],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should not validate an invalid SortingParamsDto', async () => {
      const dto = plainToClass(SortingParamsDto, {
        fields: [
          { field: 'user_id', order: 'asc' },
          { field: 'first_name', order: 'ascending' },
        ],
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);

      const orderError = errors
        .flatMap((error) => error.children)
        .flatMap((child) => child.children)
        .find((child) => child.property === 'order' && child.constraints && child.constraints.isIn);

      if (orderError && orderError.constraints) {
        expect(orderError.constraints.isIn).toContain(
          'order must be one of the following values: asc, desc',
        );
      } else {
        throw new Error('Expected to find an order constraint error');
      }
    });

    it('should validate an empty fields array', async () => {
      const dto = plainToClass(SortingParamsDto, {
        fields: [],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});

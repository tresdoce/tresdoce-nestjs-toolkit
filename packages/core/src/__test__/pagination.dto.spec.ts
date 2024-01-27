import { PaginationParamsDto } from '../decorators';
import { validate } from '@nestjs/class-validator';
import { plainToClass } from '@nestjs/class-transformer';

describe('PaginationParamsDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = plainToClass(PaginationParamsDto, {
      page: 2,
      size: 20,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should set default values for missing fields', async () => {
    const dto = plainToClass(PaginationParamsDto, {});

    // Check if default values are set
    expect(dto.page).toBe(1);
    expect(dto.size).toBe(10);

    const errors = await validate(dto);

    // Check if there are no validation errors
    expect(errors.length).toBe(0);
  });

  it('should not validate an invalid DTO', async () => {
    const dto = plainToClass(PaginationParamsDto, {
      page: -2,
      size: 150,
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isPositive', 'Page must be a positive integer');
    expect(errors[1].constraints).toHaveProperty('max', 'Size must not exceed 100');
  });

  it('should not validate when page is undefined', async () => {
    const dto = plainToClass(PaginationParamsDto, {
      size: 20,
    });

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});

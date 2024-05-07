import { PaginationParamsDto } from '../decorators';
import { validate } from '@nestjs/class-validator';
import { plainToClass } from '@nestjs/class-transformer';
import { DEFAULT_SIZE, DEFAULT_PAGE, MAX_SIZE } from '../decorators/constants/pagination.constant';

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

    expect(dto.page).toBe(DEFAULT_PAGE);
    expect(dto.size).toBe(DEFAULT_SIZE);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should not validate an invalid DTO', async () => {
    const dto = plainToClass(PaginationParamsDto, {
      page: -2,
      size: 150,
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty(
      'isPositive',
      'The page parameter is invalid. It must be a positive',
    );
    expect(errors[1].constraints).toHaveProperty(
      'max',
      `The size parameter is invalid. It must be a positive integer and cannot be more than ${MAX_SIZE}`,
    );
  });

  it('should not validate when page is undefined', async () => {
    const dto = plainToClass(PaginationParamsDto, {
      size: 20,
    });

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});

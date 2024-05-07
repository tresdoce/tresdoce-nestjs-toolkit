import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/class-transformer';
import { IsOptional, IsPositive, Max, IsInt } from '@nestjs/class-validator';
import { DEFAULT_PAGE, DEFAULT_SIZE, MAX_SIZE } from '../constants/pagination.constant';

export class PaginationParamsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'The page parameter is invalid. It must be an integer' })
  @IsPositive({ message: 'The page parameter is invalid. It must be a positive' })
  @ApiProperty({
    name: 'page',
    description: 'The current page number',
    default: DEFAULT_PAGE,
    minimum: 1,
    example: 1,
    required: false,
    type: Number,
  })
  page: number = DEFAULT_PAGE;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'The size parameter is invalid. It must be an integer' })
  @IsPositive({ message: 'The size parameter is invalid. It must be a positive' })
  @Max(MAX_SIZE, {
    message: `The size parameter is invalid. It must be a positive integer and cannot be more than ${MAX_SIZE}`,
  })
  @ApiProperty({
    name: 'size',
    description: 'The number of items per page',
    default: DEFAULT_SIZE,
    maximum: MAX_SIZE,
    example: 10,
    required: false,
    type: Number,
  })
  size: number = DEFAULT_SIZE;
}

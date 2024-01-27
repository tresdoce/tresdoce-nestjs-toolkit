import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/class-transformer';
import { IsOptional, IsPositive, Max, IsInt } from '@nestjs/class-validator';

export class PaginationParamsDto {
  @ApiProperty({
    description: 'The current page number',
    default: 1,
    example: 3,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be a positive integer' })
  @IsPositive({ message: 'Page must be a positive integer' })
  page: number = 1;

  @ApiProperty({
    description: 'The number of items per page',
    maximum: 100,
    default: 10,
    example: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Size must be a positive integer' })
  @IsPositive({ message: 'Size must be a positive integer' })
  @Max(100, { message: 'Size must not exceed 100' })
  size: number = 10;
}

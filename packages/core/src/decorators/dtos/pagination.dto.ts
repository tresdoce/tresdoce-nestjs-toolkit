import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/class-transformer';
import { IsOptional, IsPositive, Max, IsInt } from '@nestjs/class-validator';

export class PaginationParamsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be a positive integer' })
  @IsPositive({ message: 'Page must be a positive integer' })
  @ApiProperty({
    description: 'The current page number',
    default: 1,
    example: 1,
    required: false,
  })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Size must be a positive integer' })
  @IsPositive({ message: 'Size must be a positive integer' })
  @Max(100, { message: 'Size must not exceed 100' })
  @ApiProperty({
    description: 'The number of items per page',
    maximum: 100,
    default: 20,
    example: 20,
    required: false,
  })
  size: number = 20;
}

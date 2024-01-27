import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/class-transformer';
import { IsArray, ValidateNested } from '@nestjs/class-validator';
import { SortCriteriaDto } from './sort-criteria.dto';

export class SortingParamsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortCriteriaDto)
  @ApiProperty({
    description: 'An array of sorting criteria.',
    type: [SortCriteriaDto],
  })
  fields: SortCriteriaDto[];
}

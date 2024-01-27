import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/class-transformer';
import { IsArray, ValidateNested } from '@nestjs/class-validator';
import { SortCriteriaDto } from './sort-criteria.dto';

export class SortingParamsDto {
  @ApiProperty({
    description: 'An array of sorting criteria.',
    type: [SortCriteriaDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortCriteriaDto)
  fields: SortCriteriaDto[];
}

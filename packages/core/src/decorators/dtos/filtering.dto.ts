import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested, IsArray } from '@nestjs/class-validator';
import { Type } from '@nestjs/class-transformer';
import { FilteringCriteriaDto } from './filtering-criteria.dto';

export class FilteringParamsDto {
  @ApiProperty({ type: [FilteringCriteriaDto], description: 'List of filtering criteria' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilteringCriteriaDto)
  filters: FilteringCriteriaDto[];
}

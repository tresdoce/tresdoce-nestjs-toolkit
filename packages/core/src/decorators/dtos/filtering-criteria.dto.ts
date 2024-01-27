import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsArray, IsOptional } from '@nestjs/class-validator';
import { FilterRule } from '../filtering.decorator';

export class FilteringCriteriaDto {
  @IsString()
  @ApiProperty({ example: 'age', description: 'The property to filter by.' })
  property: string;

  @IsEnum(FilterRule)
  @ApiProperty({
    example: FilterRule.GREATER_THAN,
    enum: FilterRule,
    description: 'The filtering rule to apply.',
  })
  rule: FilterRule;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({
    example: ['30'],
    description: 'The value(s) for the filtering criterion.',
    type: [String],
  })
  values: string[];
}

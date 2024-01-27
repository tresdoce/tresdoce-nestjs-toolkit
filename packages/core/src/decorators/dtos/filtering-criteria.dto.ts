import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsArray, IsOptional } from '@nestjs/class-validator';
import { FilterRule } from '../filtering.decorator';

export class FilteringCriteriaDto {
  @ApiProperty({ example: 'age', description: 'The property to filter by.' })
  @IsString()
  property: string;

  @ApiProperty({
    example: FilterRule.GREATER_THAN,
    enum: FilterRule,
    description: 'The filtering rule to apply.',
  })
  @IsEnum(FilterRule)
  rule: FilterRule;

  @ApiProperty({
    example: ['30'],
    description: 'The value(s) for the filtering criterion.',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  values: string[];
}

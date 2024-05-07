import { ApiProperty } from '@nestjs/swagger';
import { IsString } from '@nestjs/class-validator';

export class FilteringParamsDto {
  @IsString()
  @ApiProperty({
    name: 'filters',
    description:
      'Filter criteria in the format property:rule:values. Multiple criteria can be separated by commas. Example: age:gt:30,status:in:active,inactive',
    required: false,
  })
  filters: string;
}

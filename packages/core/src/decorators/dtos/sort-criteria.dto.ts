import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from '@nestjs/class-validator';

export class SortCriteriaDto {
  @IsString()
  @ApiProperty({ description: 'The field name to sort by.' })
  field: string;

  @IsIn(['asc', 'desc'])
  @ApiProperty({
    description: `The order of sorting, either 'asc' or 'desc'.`,
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  order: 'asc' | 'desc' = 'asc';
}

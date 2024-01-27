import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from '@nestjs/class-validator';

export class SortCriteriaDto {
  @ApiProperty({ description: 'The field name to sort by.' })
  @IsString()
  field: string;

  @ApiProperty({
    description: `The order of sorting, either 'asc' or 'desc'.`,
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';
}

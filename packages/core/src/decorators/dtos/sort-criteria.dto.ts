import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from '@nestjs/class-validator';
import { DEFAULT_SORT_DIRECTION } from '../constants/sorting.constant';

export class SortCriteriaDto {
  @IsString()
  @ApiProperty({ description: 'The field name to sort by.' })
  field: string;

  @IsIn(['asc', 'desc'])
  @ApiProperty({
    description: `The order of sorting, either 'asc' or 'desc'.`,
    enum: ['asc', 'desc'],
    default: DEFAULT_SORT_DIRECTION,
  })
  order: 'asc' | 'desc' = DEFAULT_SORT_DIRECTION;
}

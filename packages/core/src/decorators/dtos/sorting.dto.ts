import { ApiProperty } from '@nestjs/swagger';
import { IsString } from '@nestjs/class-validator';

export class SortingParamsDto {
  @IsString()
  @ApiProperty({
    name: 'sort',
    description:
      'Sorting criteria in the format "field:direction". Multiple criteria can be separated by commas.\nExample: id:desc',
    required: false,
  })
  sort: string;
}

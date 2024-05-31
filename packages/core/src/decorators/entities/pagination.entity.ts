import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaData {
  @ApiProperty({
    required: true,
    description: 'The current page number in the pagination.',
    example: 1,
  })
  page: number;

  @ApiProperty({
    required: true,
    description: 'The number of items per page in the pagination.',
    example: 10,
  })
  size: number;

  @ApiProperty({
    required: true,
    description: 'The total number of items available.',
    example: 30,
  })
  total: number;

  @ApiProperty({
    required: false,
    description: 'The total number of pages in the pagination.',
    example: 3,
  })
  totalPages?: number;

  @ApiProperty({
    required: false,
    description: 'Indicates whether there is a next page available.',
    example: true,
  })
  hasNext?: boolean;

  @ApiProperty({
    required: false,
    description: 'Indicates whether there is a previous page available.',
    example: false,
  })
  hasPrevious?: boolean;
}

export class PaginationResponse<TData> {
  @ApiProperty({
    description: 'Data containing the response.',
    required: true,
  })
  data: TData[];

  @ApiProperty({
    description: 'Metadata for the response, including pagination information.',
    required: true,
  })
  meta: PaginationMetaData;
}

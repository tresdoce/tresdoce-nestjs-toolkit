import { Controller, Get, Param } from '@nestjs/common';
import { SkipTrace } from '../../../tracing/decorators/index.js';

import { CatsService } from './cats.service.js';
import { Cat } from './interfaces/cat.interface.js';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @SkipTrace()
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Cat> {
    return this.catsService.findOne(+id);
  }
}

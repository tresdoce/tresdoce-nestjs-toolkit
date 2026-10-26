import { Controller, Get } from '@nestjs/common';
import { ArchetypeService } from '../services/archetype.service.js';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import type { IArchetypeManifest } from '../interfaces/archetype.interface.js';

@Controller()
export class ArchetypeController {
  constructor(private readonly archetypeService: ArchetypeService) {}

  @Get('info')
  @ApiExcludeEndpoint()
  async getArchetypeInfo(): Promise<IArchetypeManifest> {
    return this.archetypeService.generateManifest();
  }
}

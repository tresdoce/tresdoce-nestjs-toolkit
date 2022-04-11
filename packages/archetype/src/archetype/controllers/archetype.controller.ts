import { Controller, Get } from '@nestjs/common';
import { ArchetypeService } from '../services/archetype.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class ArchetypeController {
  constructor(private readonly archetypeService: ArchetypeService) {}

  @Get('manifest')
  @ApiExcludeEndpoint()
  async getArchetypeInfo() {
    return this.archetypeService.generateManifest();
  }
}

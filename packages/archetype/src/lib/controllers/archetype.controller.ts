import { Controller, Get } from '@nestjs/common';
import { ArchetypeService } from '../services/archetype.service';

@Controller()
export class ArchetypeController {
  constructor(private readonly archetypeService: ArchetypeService) {}

  @Get('manifest')
  async getArchetypeInfo() {
    return await this.archetypeService.generateManifest();
  }
}

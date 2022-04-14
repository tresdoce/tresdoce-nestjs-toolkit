import { Global, Module } from '@nestjs/common';
import { ArchetypeController } from './controllers/archetype.controller';
import { ArchetypeService } from './services/archetype.service';

@Global()
@Module({
  controllers: [ArchetypeController],
  exports: [ArchetypeController],
  providers: [ArchetypeController, ArchetypeService],
})
export class ArchetypeModule {}

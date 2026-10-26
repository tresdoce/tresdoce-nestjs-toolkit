import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

export interface DatabaseOptions {
  typeorm?: TypeOrmModuleOptions;
}

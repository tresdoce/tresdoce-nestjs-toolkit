import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export interface DatabaseOptions {
  typeorm?: TypeOrmModuleOptions;
}

import type { ModuleMetadata } from '@nestjs/common';
import { ModelDefinition } from './model-definition.interface.js';

export interface AsyncModelFactory
  extends
    Pick<ModuleMetadata, 'imports'>,
    Pick<ModelDefinition, 'name' | 'options' | 'serializers'> {
  useFactory: (
    ...args: any[]
  ) =>
    | ModelDefinition['schema']
    | Promise<ModelDefinition['schema']>
    | Omit<ModelDefinition, 'name'>
    | Promise<Omit<ModelDefinition, 'name'>>;
  inject?: any[];
}

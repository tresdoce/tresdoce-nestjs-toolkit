import { SetMetadata, CustomDecorator } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]): CustomDecorator => SetMetadata(ROLES_KEY, roles);

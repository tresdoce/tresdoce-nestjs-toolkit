import { SetMetadata, CustomDecorator } from '@nestjs/common';

export const ROLES_KEY = 'roles';
/** Acepta strings o valores de enums (por ejemplo `@Roles(UserRole.Admin)`). */
export const Roles = (...roles: Array<string | number>): CustomDecorator =>
  SetMetadata(ROLES_KEY, roles);

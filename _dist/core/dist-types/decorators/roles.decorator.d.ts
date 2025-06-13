import { CustomDecorator } from '@nestjs/common';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: string[]) => CustomDecorator;

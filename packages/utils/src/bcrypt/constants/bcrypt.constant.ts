import { BcryptOptions } from '../interfaces/bcrypt.interface';

export const BCRYPT_MODULE_OPTIONS = Symbol('BCRYPT_MODULE_OPTIONS');
export const DEFAULT_SALT_ROUNDS = 16;
export const DEFAULT_MINOR = 'b';

export const BCRYPT_DEFAULT_OPTIONS: BcryptOptions = {
  rounds: DEFAULT_SALT_ROUNDS,
  minor: DEFAULT_MINOR,
};

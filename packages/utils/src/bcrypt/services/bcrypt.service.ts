import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { BCRYPT_MODULE_OPTIONS } from '../constants/bcrypt.constant';
import { BcryptOptions, BcryptVersion } from '../interfaces/bcrypt.interface';

@Injectable()
export class BcryptService {
  private salt: string;

  constructor(@Inject(BCRYPT_MODULE_OPTIONS) private readonly options: BcryptOptions) {
    this.generateSalt();
  }

  /**
   * Generates a new salt.
   * @param rounds The cost of processing the data.
   * @param minor The minor version of bcrypt to use.
   * @returns The generated salt.
   * @throws Error if an error occurs during salt generation.
   */
  public generateSalt(
    rounds: number = this.options.rounds,
    minor: BcryptVersion = this.options.minor,
  ): string {
    try {
      this.salt = bcrypt.genSaltSync(rounds, minor);
      return this.salt;
    } catch (_error) {
      /* istanbul ignore next */
      throw new Error(`Error generating salt: ${_error.message}`);
    }
  }

  /**
   * Encrypts data using bcrypt asynchronously.
   * @param data The data to encrypt.
   * @returns A Promise that resolves to the encrypted data.
   * @throws Error if an error occurs during encryption.
   */
  public async encrypt(data: string): Promise<string> {
    try {
      return await bcrypt.hash(data, this.salt);
    } catch (_error) {
      /* istanbul ignore next */
      throw new Error(`Error encrypting data: ${_error.message}`);
    }
  }

  /**
   * Encrypts data using bcrypt synchronously.
   * @param data The data to encrypt.
   * @returns The encrypted data.
   * @throws Error if an error occurs during encryption.
   */
  public encryptSync(data: string): string {
    try {
      return bcrypt.hashSync(data, this.salt);
    } catch (_error) {
      /* istanbul ignore next */
      throw new Error(`Error synchronously encrypting data: ${_error.message}`);
    }
  }

  /**
   * Compares data with encrypted data using bcrypt asynchronously.
   * @param data The data to compare.
   * @param encryptedData The encrypted data.
   * @returns A Promise that resolves to true if the data matches the encrypted data, false otherwise.
   * @throws Error if an error occurs during comparison.
   */
  public async compare(data: string, encryptedData: string): Promise<boolean> {
    try {
      return await bcrypt.compare(data, encryptedData);
    } catch (_error) {
      /* istanbul ignore next */
      throw new Error(`Error comparing data: ${_error.message}`);
    }
  }

  /**
   * Compares data with encrypted data using bcrypt synchronously.
   * @param data The data to compare.
   * @param encryptedData The encrypted data.
   * @returns True if the data matches the encrypted data, false otherwise.
   * @throws Error if an error occurs during comparison.
   */
  public compareSync(data: string, encryptedData: string): boolean {
    try {
      return bcrypt.compareSync(data, encryptedData);
    } catch (_error) {
      /* istanbul ignore next */
      throw new Error(`Error synchronously comparing data: ${_error.message}`);
    }
  }

  /**
   * Generates a secure hash for a password using bcrypt.
   * @param password The password to hash.
   * @returns The hashed password.
   * @throws Error if an error occurs during hash generation.
   */
  public generatePasswordHash(password: string): string {
    try {
      return bcrypt.hashSync(password, this.salt);
    } catch (_error) {
      /* istanbul ignore next */
      throw new Error(`Error generating password hash: ${_error.message}`);
    }
  }

  /**
   * Validates if a hash is valid for the current salt rounds.
   * @param hash The hash to validate.
   * @returns True if the hash is valid, false otherwise.
   * @throws Error if an error occurs during hash validation.
   * @example
   * const isValid = bcryptService.validateHash('$2b$10$M2ZUWr3YlD3uEZuGZ7oMdObk0jOcoBCK6a2jthqWak36KoQFYIzR6');
   */
  public validateHash(hash: string): boolean {
    try {
      return bcrypt.getRounds(hash) === bcrypt.getRounds(this.salt);
    } catch (_error) {
      /* istanbul ignore next */
      throw new Error(`Error validating hash: ${_error.message}`);
    }
  }
}

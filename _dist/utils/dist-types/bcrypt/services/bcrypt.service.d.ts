import { BcryptOptions, BcryptVersion } from '../interfaces/bcrypt.interface';
export declare class BcryptService {
    private readonly options;
    private salt;
    constructor(options: BcryptOptions);
    /**
     * Generates a new salt.
     * @param rounds The cost of processing the data.
     * @param minor The minor version of bcrypt to use.
     * @returns The generated salt.
     * @throws Error if an error occurs during salt generation.
     */
    generateSalt(rounds?: number, minor?: BcryptVersion): string;
    /**
     * Encrypts data using bcrypt asynchronously.
     * @param data The data to encrypt.
     * @returns A Promise that resolves to the encrypted data.
     * @throws Error if an error occurs during encryption.
     */
    encrypt(data: string): Promise<string>;
    /**
     * Encrypts data using bcrypt synchronously.
     * @param data The data to encrypt.
     * @returns The encrypted data.
     * @throws Error if an error occurs during encryption.
     */
    encryptSync(data: string): string;
    /**
     * Compares data with encrypted data using bcrypt asynchronously.
     * @param data The data to compare.
     * @param encryptedData The encrypted data.
     * @returns A Promise that resolves to true if the data matches the encrypted data, false otherwise.
     * @throws Error if an error occurs during comparison.
     */
    compare(data: string, encryptedData: string): Promise<boolean>;
    /**
     * Compares data with encrypted data using bcrypt synchronously.
     * @param data The data to compare.
     * @param encryptedData The encrypted data.
     * @returns True if the data matches the encrypted data, false otherwise.
     * @throws Error if an error occurs during comparison.
     */
    compareSync(data: string, encryptedData: string): boolean;
    /**
     * Generates a secure hash for a password using bcrypt.
     * @param password The password to hash.
     * @returns The hashed password.
     * @throws Error if an error occurs during hash generation.
     */
    generatePasswordHash(password: string): string;
    /**
     * Validates if a hash is valid for the current salt rounds.
     * @param hash The hash to validate.
     * @returns True if the hash is valid, false otherwise.
     * @throws Error if an error occurs during hash validation.
     * @example
     * const isValid = bcryptService.validateHash('$2b$10$M2ZUWr3YlD3uEZuGZ7oMdObk0jOcoBCK6a2jthqWak36KoQFYIzR6');
     */
    validateHash(hash: string): boolean;
}

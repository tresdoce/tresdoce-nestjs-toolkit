var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BCRYPT_MODULE_OPTIONS } from '../constants/bcrypt.constant';
let BcryptService = class BcryptService {
    constructor(options) {
        this.options = options;
        this.generateSalt();
    }
    /**
     * Generates a new salt.
     * @param rounds The cost of processing the data.
     * @param minor The minor version of bcrypt to use.
     * @returns The generated salt.
     * @throws Error if an error occurs during salt generation.
     */
    generateSalt(rounds = this.options.rounds, minor = this.options.minor) {
        try {
            this.salt = bcrypt.genSaltSync(rounds, minor);
            return this.salt;
        }
        catch (_error) {
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
    async encrypt(data) {
        try {
            return await bcrypt.hash(data, this.salt);
        }
        catch (_error) {
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
    encryptSync(data) {
        try {
            return bcrypt.hashSync(data, this.salt);
        }
        catch (_error) {
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
    async compare(data, encryptedData) {
        try {
            return await bcrypt.compare(data, encryptedData);
        }
        catch (_error) {
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
    compareSync(data, encryptedData) {
        try {
            return bcrypt.compareSync(data, encryptedData);
        }
        catch (_error) {
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
    generatePasswordHash(password) {
        try {
            return bcrypt.hashSync(password, this.salt);
        }
        catch (_error) {
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
    validateHash(hash) {
        try {
            return bcrypt.getRounds(hash) === bcrypt.getRounds(this.salt);
        }
        catch (_error) {
            /* istanbul ignore next */
            throw new Error(`Error validating hash: ${_error.message}`);
        }
    }
};
BcryptService = __decorate([
    Injectable(),
    __param(0, Inject(BCRYPT_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], BcryptService);
export { BcryptService };

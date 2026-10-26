import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

import { BcryptModule } from '../bcrypt/bcrypt.module.js';
import { BcryptService } from '../bcrypt/services/bcrypt.service.js';

describe('BcryptService', () => {
  let app: INestApplication;
  let service: BcryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          // 4 rounds (mínimo de bcrypt) solo en tests: misma lógica, hash en milisegundos.
          // El default productivo sigue siendo DEFAULT_SALT_ROUNDS (16).
          load: [dynamicConfig({ bcrypt: { rounds: 4 } })],
        }),
        BcryptModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    service = module.get<BcryptService>(BcryptService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a new salt with default options', () => {
    const salt = service.generateSalt();
    expect(salt).toBeDefined();
    expect(typeof salt).toBe('string');
  });

  it('should generate a new salt with custom options', () => {
    const salt = service.generateSalt(12, 'a');
    expect(salt).toBeDefined();
    expect(typeof salt).toBe('string');
  });

  it('should encrypt and decrypt data correctly', async () => {
    const data = 'password';
    const encryptedData = await service.encrypt(data);
    expect(encryptedData).toBeDefined();
    expect(typeof encryptedData).toBe('string');

    const compareResult = await service.compare(data, encryptedData);
    expect(compareResult).toBe(true);
  });

  it('should encrypt and decrypt data synchronously', () => {
    const data = 'password';
    const encryptedData = service.encryptSync(data);
    expect(encryptedData).toBeDefined();
    expect(typeof encryptedData).toBe('string');

    const compareResult = service.compareSync(data, encryptedData);
    expect(compareResult).toBe(true);
  });

  it('should generate password hash and validate hash correctly', () => {
    const password = 'password';
    const hash = service.generatePasswordHash(password);
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');

    const isValid = service.validateHash(hash);
    expect(isValid).toBe(true);
  });

  it('should throw an error if encryption fails', async () => {
    vi.spyOn(service, 'encrypt').mockRejectedValueOnce(
      new Error('Error encrypting data: Encryption failed'),
    );

    await expect(service.encrypt('password')).rejects.toThrow(
      'Error encrypting data: Encryption failed',
    );
  });

  it('should throw an error if decryption fails', async () => {
    vi.spyOn(service, 'compare').mockRejectedValueOnce(
      new Error('Error comparing data: Decryption failed'),
    );

    const encryptedData = await service.encrypt('password');

    await expect(service.compare('password', encryptedData)).rejects.toThrow(
      'Error comparing data: Decryption failed',
    );
  });

  it('should throw an error if password hashing fails', () => {
    vi.spyOn(service, 'generatePasswordHash').mockImplementationOnce(() => {
      throw new Error('Error generating password hash: Hashing failed');
    });

    expect(() => service.generatePasswordHash('password')).toThrow(
      'Error generating password hash: Hashing failed',
    );
  });

  it('should throw an error if hash validation fails', () => {
    const hash = service.generatePasswordHash('password');

    vi.spyOn(service, 'validateHash').mockImplementationOnce(() => {
      throw new Error('Error validating hash: Validation failed');
    });

    expect(() => service.validateHash(hash)).toThrow('Error validating hash: Validation failed');
  });
  it('should generate a different hash (random salt) for each call', async () => {
    const first = await service.encrypt('password');
    const second = await service.encrypt('password');
    expect(first).not.toBe(second);
    expect(service.encryptSync('password')).not.toBe(service.encryptSync('password'));
    expect(service.generatePasswordHash('password')).not.toBe(
      service.generatePasswordHash('password'),
    );
    await expect(service.compare('password', first)).resolves.toBe(true);
    await expect(service.compare('password', second)).resolves.toBe(true);
  });

  it('should use rounds and version of the last generated salt', () => {
    service.generateSalt(5, 'a');
    const hash = service.encryptSync('password');
    expect(hash.startsWith('$2a$05$')).toBe(true);
    expect(service.validateHash(hash)).toBe(true);
  });

  it('should return false when compare against an invalid hash', async () => {
    await expect(service.compare('password', 'invalid-hash')).resolves.toBe(false);
    expect(service.compareSync('password', 'invalid-hash')).toBe(false);
  });

  describe('real bcrypt errors', () => {
    const invalid = null as unknown as string;

    it('should wrap salt generation errors', () => {
      expect(() => service.generateSalt('x' as unknown as number)).toThrow(
        'Error generating salt: rounds must be a number',
      );
    });

    it('should wrap async encryption errors', async () => {
      await expect(service.encrypt(invalid)).rejects.toThrow(
        'Error encrypting data: data and salt arguments required',
      );
    });

    it('should wrap sync encryption errors', () => {
      expect(() => service.encryptSync(invalid)).toThrow(
        'Error synchronously encrypting data: data and salt arguments required',
      );
    });

    it('should wrap async comparison errors', async () => {
      await expect(service.compare(invalid, 'hash')).rejects.toThrow(
        'Error comparing data: data and hash arguments required',
      );
    });

    it('should wrap sync comparison errors', () => {
      expect(() => service.compareSync(invalid, 'hash')).toThrow(
        'Error synchronously comparing data: data and hash arguments required',
      );
    });

    it('should wrap password hashing errors', () => {
      expect(() => service.generatePasswordHash(invalid)).toThrow(
        'Error generating password hash: data and salt arguments required',
      );
    });

    it('should wrap hash validation errors', () => {
      expect(() => service.validateHash('not-a-bcrypt-hash')).toThrow(
        'Error validating hash: invalid hash provided',
      );
    });
  });
});

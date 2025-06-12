import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

import { BcryptModule } from '../bcrypt/bcrypt.module';
import { BcryptService } from '../bcrypt/services/bcrypt.service';

describe('BcryptService', () => {
  let app: INestApplication;
  let service: BcryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [dynamicConfig()],
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
    jest
      .spyOn(service, 'encrypt')
      .mockRejectedValueOnce(new Error('Error encrypting data: Encryption failed'));

    await expect(service.encrypt('password')).rejects.toThrow(
      'Error encrypting data: Encryption failed',
    );
  });

  it('should throw an error if decryption fails', async () => {
    jest
      .spyOn(service, 'compare')
      .mockRejectedValueOnce(new Error('Error comparing data: Decryption failed'));

    const encryptedData = await service.encrypt('password');

    await expect(service.compare('password', encryptedData)).rejects.toThrow(
      'Error comparing data: Decryption failed',
    );
  });

  it('should throw an error if password hashing fails', () => {
    jest.spyOn(service, 'generatePasswordHash').mockImplementationOnce(() => {
      throw new Error('Error generating password hash: Hashing failed');
    });

    expect(() => service.generatePasswordHash('password')).toThrow(
      'Error generating password hash: Hashing failed',
    );
  });

  it('should throw an error if hash validation fails', () => {
    const hash = service.generatePasswordHash('password');

    jest.spyOn(service, 'validateHash').mockImplementationOnce(() => {
      throw new Error('Error validating hash: Validation failed');
    });

    expect(() => service.validateHash(hash)).toThrow('Error validating hash: Validation failed');
  });
});

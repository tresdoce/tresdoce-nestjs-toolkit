import { Test, TestingModule } from '@nestjs/testing';
import { QRCodeToBufferOptions, QRCodeToDataURLOptions } from 'qrcode';

import { QrCodeService } from '../qr-code/services/qr-code.service';

const options: QRCodeToDataURLOptions = {
  width: 100,
  margin: 1,
};

const optionsBuffer: QRCodeToBufferOptions = {
  width: 100,
  margin: 1,
};

describe('QrCodeService', () => {
  let service: QrCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QrCodeService],
    }).compile();

    service = module.get<QrCodeService>(QrCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Base64', () => {
    it('should handle text QR code data', async () => {
      const result = await service.createQrCode({ type: 'text', text: 'Hello World' });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.startsWith('data:image/png;base64,')).toBeTruthy();
      expect(result.length).toBeGreaterThan(100);
    });

    it('should handle text QR code data with options', async () => {
      const result = await service.createQrCode({ type: 'text', text: 'Hello World' }, options);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.startsWith('data:image/png;base64,')).toBeTruthy();
      expect(result.length).toBeGreaterThan(100);
    });

    it('should handle url QR code data', async () => {
      const result = await service.createQrCode({ type: 'url', url: 'https://example.com' });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.startsWith('data:image/png;base64,')).toBeTruthy();
      expect(result.length).toBeGreaterThan(100);
    });

    it('should handle wifi QR code data', async () => {
      const result = await service.createQrCode({
        type: 'wifi',
        ssid: 'MyWifi',
        password: 'password123',
        encryption: 'WPA',
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.startsWith('data:image/png;base64,')).toBeTruthy();
      expect(result.length).toBeGreaterThan(100);
    });

    it('should handle vcard QR code data', async () => {
      const result = await service.createQrCode({
        type: 'vcard',
        name: 'John Doe',
        organization: 'Company',
        phone: '+123456789',
        email: 'john.doe@example.com',
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.startsWith('data:image/png;base64,')).toBeTruthy();
      expect(result.length).toBeGreaterThan(100);
    });

    it('should handle email QR code data', async () => {
      const result = await service.createQrCode({
        type: 'email',
        address: 'info@example.com',
        subject: 'Greetings',
        body: 'Hello World',
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.startsWith('data:image/png;base64,')).toBeTruthy();
      expect(result.length).toBeGreaterThan(100);
    });

    it('should handle sms QR code data', async () => {
      const result = await service.createQrCode({
        type: 'sms',
        phone: '+123456789',
        message: 'Hello World',
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.startsWith('data:image/png;base64,')).toBeTruthy();
      expect(result.length).toBeGreaterThan(100);
    });

    it('should handle whatsapp QR code data', async () => {
      const result = await service.createQrCode({
        type: 'whatsapp',
        phone: '+123456789',
        message: 'Hello World',
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.startsWith('data:image/png;base64,')).toBeTruthy();
      expect(result.length).toBeGreaterThan(100);
    });

    it('should handle geo QR code data', async () => {
      const result = await service.createQrCode({
        type: 'geo',
        latitude: 40.416775,
        longitude: -3.70379,
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.startsWith('data:image/png;base64,')).toBeTruthy();
      expect(result.length).toBeGreaterThan(100);
    });

    it('should handle event QR code data', async () => {
      const result = await service.createQrCode({
        type: 'event',
        summary: 'Meeting',
        start: '20231015T170000Z',
        end: '20231015T190000Z',
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.startsWith('data:image/png;base64,')).toBeTruthy();
      expect(result.length).toBeGreaterThan(100);
    });

    it('should handle crypto QR code data', async () => {
      const result = await service.createQrCode({
        type: 'crypto',
        currency: 'Bitcoin',
        address: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.startsWith('data:image/png;base64,')).toBeTruthy();
      expect(result.length).toBeGreaterThan(100);
    });

    it('should throw an error for an invalid QR code type', async () => {
      await expect(
        // @ts-ignore
        service.createQrCode({ type: 'invalid', text: 'Invalid' }),
      ).rejects.toThrow('Invalid QR Code data type');
    });

    it('should throw an error for an invalid URL', async () => {
      await expect(service.createQrCode({ type: 'url', url: 'invalid-url' })).rejects.toThrow(
        'URL not valid',
      );
    });
  });

  describe('Buffer', () => {
    it('should handle text QR code data [Buffer]', async () => {
      const result = await service.createQrCodeBuffer({ type: 'text', text: 'Hello World' });

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Buffer);

      const normalize = result.toString('base64');
      expect(typeof normalize).toBe('string');
      expect(normalize.startsWith('data:image/png;base64,')).toBeFalsy();
      expect(normalize.length).toBeGreaterThan(100);
    });

    it('should handle text QR code data with options [Buffer]', async () => {
      const result = await service.createQrCodeBuffer(
        { type: 'text', text: 'Hello World' },
        optionsBuffer,
      );

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Buffer);

      const normalize = result.toString('base64');
      expect(typeof normalize).toBe('string');
      expect(normalize.startsWith('data:image/png;base64,')).toBeFalsy();
      expect(normalize.length).toBeGreaterThan(100);
    });

    it('should handle url QR code data [Buffer]', async () => {
      const result = await service.createQrCodeBuffer({ type: 'url', url: 'https://example.com' });

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Buffer);

      const normalize = result.toString('base64');
      expect(typeof normalize).toBe('string');
      expect(normalize.startsWith('data:image/png;base64,')).toBeFalsy();
      expect(normalize.length).toBeGreaterThan(100);
    });

    it('should handle wifi QR code data [Buffer]', async () => {
      const result = await service.createQrCodeBuffer({
        type: 'wifi',
        ssid: 'MyWifi',
        password: 'password123',
        encryption: 'WPA',
      });

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Buffer);

      const normalize = result.toString('base64');
      expect(typeof normalize).toBe('string');
      expect(normalize.startsWith('data:image/png;base64,')).toBeFalsy();
      expect(normalize.length).toBeGreaterThan(100);
    });

    it('should handle vcard QR code data [Buffer]', async () => {
      const result = await service.createQrCodeBuffer({
        type: 'vcard',
        name: 'John Doe',
        organization: 'Company',
        phone: '+123456789',
        email: 'john.doe@example.com',
      });

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Buffer);

      const normalize = result.toString('base64');
      expect(typeof normalize).toBe('string');
      expect(normalize.startsWith('data:image/png;base64,')).toBeFalsy();
      expect(normalize.length).toBeGreaterThan(100);
    });

    it('should handle email QR code data [Buffer]', async () => {
      const result = await service.createQrCodeBuffer({
        type: 'email',
        address: 'info@example.com',
        subject: 'Greetings',
        body: 'Hello World',
      });

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Buffer);

      const normalize = result.toString('base64');
      expect(typeof normalize).toBe('string');
      expect(normalize.startsWith('data:image/png;base64,')).toBeFalsy();
      expect(normalize.length).toBeGreaterThan(100);
    });

    it('should handle sms QR code data [Buffer]', async () => {
      const result = await service.createQrCodeBuffer({
        type: 'sms',
        phone: '+123456789',
        message: 'Hello World',
      });

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Buffer);

      const normalize = result.toString('base64');
      expect(typeof normalize).toBe('string');
      expect(normalize.startsWith('data:image/png;base64,')).toBeFalsy();
      expect(normalize.length).toBeGreaterThan(100);
    });

    it('should handle whatsapp QR code data [Buffer]', async () => {
      const result = await service.createQrCodeBuffer({
        type: 'whatsapp',
        phone: '+123456789',
        message: 'Hello World',
      });

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Buffer);

      const normalize = result.toString('base64');
      expect(typeof normalize).toBe('string');
      expect(normalize.startsWith('data:image/png;base64,')).toBeFalsy();
      expect(normalize.length).toBeGreaterThan(100);
    });

    it('should handle geo QR code data [Buffer]', async () => {
      const result = await service.createQrCodeBuffer({
        type: 'geo',
        latitude: 40.416775,
        longitude: -3.70379,
      });

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Buffer);

      const normalize = result.toString('base64');
      expect(typeof normalize).toBe('string');
      expect(normalize.startsWith('data:image/png;base64,')).toBeFalsy();
      expect(normalize.length).toBeGreaterThan(100);
    });

    it('should handle event QR code data [Buffer]', async () => {
      const result = await service.createQrCodeBuffer({
        type: 'event',
        summary: 'Meeting',
        start: '20231015T170000Z',
        end: '20231015T190000Z',
      });

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Buffer);

      const normalize = result.toString('base64');
      expect(typeof normalize).toBe('string');
      expect(normalize.startsWith('data:image/png;base64,')).toBeFalsy();
      expect(normalize.length).toBeGreaterThan(100);
    });

    it('should handle crypto QR code data [Buffer]', async () => {
      const result = await service.createQrCodeBuffer({
        type: 'crypto',
        currency: 'Bitcoin',
        address: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
      });

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Buffer);

      const normalize = result.toString('base64');
      expect(typeof normalize).toBe('string');
      expect(normalize.startsWith('data:image/png;base64,')).toBeFalsy();
      expect(normalize.length).toBeGreaterThan(100);
    });

    it('should throw an error for an invalid QR code type [Buffer]', async () => {
      await expect(
        // @ts-ignore
        service.createQrCodeBuffer({ type: 'invalid', text: 'Invalid' }),
      ).rejects.toThrow('Invalid QR Code data type');
    });

    it('should throw an error for an invalid URL [Buffer]', async () => {
      await expect(service.createQrCodeBuffer({ type: 'url', url: 'invalid-url' })).rejects.toThrow(
        'URL not valid',
      );
    });
  });
});

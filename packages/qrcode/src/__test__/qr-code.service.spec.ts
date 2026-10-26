import { Test, TestingModule } from '@nestjs/testing';
import QRCode from 'qrcode';
import type { QRCodeToBufferOptions, QRCodeToDataURLOptions } from 'qrcode';

import { QrCodeService } from '../qr-code/services/qr-code.service.js';

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

  describe('Encoded payload', () => {
    const encodedPayload = async (data: Parameters<QrCodeService['createQrCode']>[0]) => {
      const spy = vi.spyOn(QRCode, 'toDataURL');
      await service.createQrCode(data);
      const [payload] = spy.mock.calls[0];
      spy.mockRestore();
      return payload;
    };

    it('should escape special characters in wifi ssid and password', async () => {
      const payload = await encodedPayload({
        type: 'wifi',
        ssid: 'My;Wifi',
        password: 'pa:ss,"w\\d',
        encryption: 'WPA',
      });
      expect(payload).toBe(String.raw`WIFI:T:WPA;S:My\;Wifi;P:pa\:ss\,\"w\\d;;`);
    });

    it('should support open (nopass) and hidden wifi networks', async () => {
      const payload = await encodedPayload({
        type: 'wifi',
        ssid: 'OpenWifi',
        password: 'ignored',
        encryption: 'nopass',
        hidden: true,
      });
      expect(payload).toBe('WIFI:T:nopass;S:OpenWifi;H:true;;');
    });

    it('should use an empty password when it is not provided', async () => {
      const payload = await encodedPayload({ type: 'wifi', ssid: 'MyWifi', encryption: 'WPA' });
      expect(payload).toBe('WIFI:T:WPA;S:MyWifi;P:;;');
    });

    it('should escape vcard text values', async () => {
      const payload = await encodedPayload({
        type: 'vcard',
        name: 'Doe, John',
        organization: 'ACME; Inc\\Labs',
        phone: '+123456789',
        email: 'john.doe@example.com',
      });
      expect(payload).toBe(
        'BEGIN:VCARD\nVERSION:3.0\nFN:Doe\\, John\nORG:ACME\\; Inc\\\\Labs\nTEL:+123456789\nEMAIL:john.doe@example.com\nEND:VCARD',
      );
    });

    it('should escape event summary', async () => {
      const payload = await encodedPayload({
        type: 'event',
        summary: 'Meeting\nRoom 1, floor 2',
        start: '20231015T170000Z',
        end: '20231015T190000Z',
      });
      expect(payload).toBe(
        'BEGIN:VEVENT\nSUMMARY:Meeting\\nRoom 1\\, floor 2\nDTSTART:20231015T170000Z\nDTEND:20231015T190000Z\nEND:VEVENT',
      );
    });

    it('should keep only digits in whatsapp phone', async () => {
      const payload = await encodedPayload({
        type: 'whatsapp',
        phone: '+54 9 11-1234-5678',
        message: 'Hola Mundo',
      });
      expect(payload).toBe('https://wa.me/5491112345678?text=Hola%20Mundo');
    });

    it('should reject Object.prototype keys as QR code type', async () => {
      await expect(
        // @ts-expect-error invalid type
        service.createQrCode({ type: 'toString' }),
      ).rejects.toThrow('Invalid QR Code data type');
    });

    it('should reject missing data', async () => {
      await expect(service.createQrCode(undefined)).rejects.toThrow('Invalid QR Code data type');
    });

    it('should keep the original error as cause', async () => {
      const error = await service
        .createQrCodeBuffer({ type: 'url', url: 'invalid-url' })
        .catch((_e: Error) => _e);
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('[Buffer] Error creating QR code: URL not valid');
      expect((error as Error).cause).toBeInstanceOf(Error);
    });
  });
});

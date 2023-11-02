import { Injectable } from '@nestjs/common';
import QRCode, { QRCodeToBufferOptions, QRCodeToDataURLOptions } from 'qrcode';

import {
  QRCodeData,
  PlainTextQR,
  URLQR,
  WiFiQR,
  VCardQR,
  EmailQR,
  SMSQR,
  GeoQR,
  EventQR,
  CryptoQR,
  WhatsappQR,
} from '../interfaces/qr-code.interface';
import {
  DEFAULT_QRCODE_OPTIONS_BUFFER,
  DEFAULT_QRCODE_OPTIONS_URL,
  QRCODE_MSG_ERROR_CREATE_QRCODE,
  QRCODE_MSG_INVALID_DATA_TYPE,
  QRCODE_MSG_URL_NOT_VALID,
} from '../constants/qr-code.constant';

@Injectable()
export class QrCodeService {
  private qrDataGenerators: Record<string, (_data: QRCodeData) => string> = {
    text: (_data: PlainTextQR) => _data.text,
    url: (_data: URLQR) => this.validateUrl(_data.url),
    wifi: (_data: WiFiQR) => this.generateWiFi(_data),
    vcard: (_data: VCardQR) => this.generateVCard(_data),
    email: (_data: EmailQR) => this.generateEmail(_data),
    sms: (_data: SMSQR) => this.generateSMS(_data),
    whatsapp: (_data: WhatsappQR) => this.generateWhatsapp(_data),
    geo: (_data: GeoQR) => this.generateGeo(_data),
    event: (_data: EventQR) => this.generateEvent(_data),
    crypto: (_data: CryptoQR) => this.generateCrypto(_data),
  };

  /**
   * Valida si una URL es válida.
   *
   * @param {string} _url - URL a validar.
   * @returns {string} URL validada.
   * @throws {Error} Si la URL no es válida.
   */
  private validateUrl(_url: string): string {
    if (!this.isValidUrl(_url)) {
      throw new Error(QRCODE_MSG_URL_NOT_VALID);
    }
    return _url;
  }

  /**
   * Determina si una cadena es una URL válida.
   *
   * @param {string} _url - La cadena a verificar.
   * @returns {boolean} True si la cadena es una URL válida, false en caso contrario.
   */
  private isValidUrl(_url: string): boolean {
    try {
      new URL(_url);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Las siguientes funciones privadas generan la cadena de datos para diferentes tipos de QR

  private generateWiFi(_data: WiFiQR): string {
    return `WIFI:T:${_data.encryption};S:${_data.ssid};P:${_data.password};;`;
  }

  private generateVCard(_data: VCardQR): string {
    return `BEGIN:VCARD\nVERSION:3.0\nFN:${_data.name}\nORG:${_data.organization}\nTEL:${_data.phone}\nEMAIL:${_data.email}\nEND:VCARD`;
  }

  private generateEmail(_data: EmailQR): string {
    return `mailto:${_data.address}?subject=${encodeURIComponent(
      _data.subject,
    )}&body=${encodeURIComponent(_data.body)}`;
  }

  private generateSMS(_data: SMSQR): string {
    return `SMSTO:${_data.phone}:${_data.message}`;
  }

  private generateWhatsapp(_data: WhatsappQR): string {
    return `https://wa.me/${_data.phone}?text=${encodeURIComponent(_data.message)}`;
  }

  private generateGeo(_data: GeoQR): string {
    return `geo:${_data.latitude},${_data.longitude}`;
  }

  private generateEvent(_data: EventQR): string {
    return `BEGIN:VEVENT\nSUMMARY:${_data.summary}\nDTSTART:${_data.start}\nDTEND:${_data.end}\nEND:VEVENT`;
  }

  private generateCrypto(_data: CryptoQR): string {
    return `${_data.currency.toLowerCase()}:${_data.address}`;
  }

  /**
   * Crea un código QR basado en los parámetros proporcionados. Puede devolver el código QR como URL en base64.
   *
   * @param {QRCodeData} _data - Datos y tipo del QR a generar.
   * @param {QRCodeToDataURLOptions} [_options={}] - Opciones adicionales para la generación del QR.
   * @returns {Promise<string>} Una promesa que resuelve el código QR generado como una URL en base64.
   * @throws {Error} Si falla la generación del código QR.
   *
   * @example
   * // Generar un código QR de texto plano como base64
   * createQrCode({type: 'text', text: 'Hola Mundo'})
   *
   * @example
   * // Generar un código QR de texto plano con opciones de configuración como base64
   * createQrCode({type: 'text', text: 'Hola Mundo'}, {errorCorrectionLevel: 'H', width: 200})
   *
   * @example
   * // Generar un código QR de URL como base64
   * createQrCode({type: 'url', url: 'https://www.ejemplo.com'})
   *
   * @example
   * // Generar un código QR de WiFi como base64
   * createQrCode({
   *   type: 'wifi',
   *   ssid: 'MiWifi',
   *   password: 'password123',
   *   encryption: 'WPA'
   * })
   *
   * @example
   * // Generar un código QR de vCard como base64
   * createQrCode({
   *   type: 'vcard',
   *   name: 'Juan Perez',
   *   phone: '+34123456789',
   *   email: 'juan.perez@ejemplo.com',
   *   organization: 'Ejemplo S.A.'
   * })
   *
   * @example
   * // Generar un código QR de Email como base64
   * createQrCode({
   *   type: 'email',
   *   address: 'info@ejemplo.com',
   *   subject: 'Saludos',
   *   body: 'Hola, este es un email de ejemplo.'
   * })
   *
   * @example
   * // Generar un código QR de SMS como base64
   * createQrCode({
   *   type: 'sms',
   *   phone: '+34123456789',
   *   message: 'Hola, ¿cómo estás?'
   * })
   *
   * @example
   * // Generar un código QR de Whatsapp como base64
   * createQrCode({
   *   type: 'whatsapp',
   *   phone: '+34123456789',
   *   message: 'Hola, ¿cómo estás?'
   * })
   *
   * @example
   * // Generar un código QR de Geolocalización como base64
   * createQrCode({
   *   type: 'geo',
   *   latitude: 40.416775,
   *   longitude: -3.703790
   * })
   *
   * @example
   * // Generar un código QR de Evento como base64
   * createQrCode({
   *   type: 'event',
   *   summary: 'Reunión de Trabajo',
   *   start: '20231015T170000Z',
   *   end: '20231015T190000Z'
   * })
   *
   * @example
   * // Generar un código QR de Criptomoneda como base64
   * createQrCode({
   *   type: 'crypto',
   *   currency: 'Bitcoin',
   *   address: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT'
   * })
   */
  public async createQrCode(
    _data: QRCodeData,
    _options: QRCodeToDataURLOptions = {},
  ): Promise<string> {
    try {
      const generateData = this.qrDataGenerators[_data.type];
      if (!generateData) {
        throw new Error(QRCODE_MSG_INVALID_DATA_TYPE);
      }

      const qrData: string = generateData(_data);
      const qrOptions: QRCodeToDataURLOptions = { ...DEFAULT_QRCODE_OPTIONS_URL, ..._options };
      return await QRCode.toDataURL(qrData, qrOptions);
    } catch (_error) {
      throw new Error(`${QRCODE_MSG_ERROR_CREATE_QRCODE} ${_error.message}`);
    }
  }

  /**
   * Crea un código QR basado en los parámetros proporcionados. Puede devolver el código QR como Buffer.
   *
   * @param {QRCodeData} _data - Datos y tipo del QR a generar.
   * @param {QRCodeToBufferOptions} [_options={}] - Opciones adicionales para la generación del QR.
   * @returns {Promise<Buffer>} Una promesa que resuelve el código QR generado como un Buffer.
   * @throws {Error} Si falla la generación del código QR.
   *
   * @example
   * // Generar un código QR de texto plano como Buffer
   * createQrCodeBuffer({type: 'text', text: 'Hola Mundo'})
   *
   * @example
   * // Generar un código QR de texto plano con opciones de configuración como Buffer
   * createQrCodeBuffer({type: 'text', text: 'Hola Mundo'}, {errorCorrectionLevel: 'H', width: 200})
   *
   * @example
   * // Generar un código QR de URL como Buffer
   * createQrCodeBuffer({type: 'url', url: 'https://www.ejemplo.com'})
   *
   * @example
   * // Generar un código QR de WiFi como Buffer
   * createQrCodeBuffer({
   *   type: 'wifi',
   *   ssid: 'MiWifi',
   *   password: 'password123',
   *   encryption: 'WPA'
   * })
   *
   * @example
   * // Generar un código QR de vCard como Buffer
   * createQrCodeBuffer({
   *   type: 'vcard',
   *   name: 'Juan Perez',
   *   phone: '+34123456789',
   *   email: 'juan.perez@ejemplo.com',
   *   organization: 'Ejemplo S.A.'
   * })
   *
   * @example
   * // Generar un código QR de Email como Buffer
   * createQrCodeBuffer({
   *   type: 'email',
   *   address: 'info@ejemplo.com',
   *   subject: 'Saludos',
   *   body: 'Hola, este es un email de ejemplo.'
   * })
   *
   * @example
   * // Generar un código QR de SMS como Buffer
   * createQrCodeBuffer({
   *   type: 'sms',
   *   phone: '+34123456789',
   *   message: 'Hola, ¿cómo estás?'
   * })
   *
   * @example
   * // Generar un código QR de Whatsapp como Buffer
   * createQrCodeBuffer({
   *   type: 'whatsapp',
   *   phone: '+34123456789',
   *   message: 'Hola, ¿cómo estás?'
   * })
   *
   * @example
   * // Generar un código QR de Geolocalización como Buffer
   * createQrCodeBuffer({
   *   type: 'geo',
   *   latitude: 40.416775,
   *   longitude: -3.703790
   * })
   *
   * @example
   * // Generar un código QR de Evento como Buffer
   * createQrCodeBuffer({
   *   type: 'event',
   *   summary: 'Reunión de Trabajo',
   *   start: '20231015T170000Z',
   *   end: '20231015T190000Z'
   * })
   *
   * @example
   * // Generar un código QR de Criptomoneda como Buffer
   * createQrCodeBuffer({
   *   type: 'crypto',
   *   currency: 'Bitcoin',
   *   address: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT'
   * })
   */
  public async createQrCodeBuffer(
    _data: QRCodeData,
    _options: QRCodeToBufferOptions = {},
  ): Promise<Buffer> {
    try {
      const generateData = this.qrDataGenerators[_data.type];
      if (!generateData) {
        throw new Error(`[Buffer] ${QRCODE_MSG_INVALID_DATA_TYPE}`);
      }

      const qrData: string = generateData(_data);
      const qrOptions: QRCodeToBufferOptions = { ...DEFAULT_QRCODE_OPTIONS_BUFFER, ..._options };
      return await QRCode.toBuffer(qrData, qrOptions);
    } catch (_error) {
      throw new Error(`[Buffer] ${QRCODE_MSG_ERROR_CREATE_QRCODE} ${_error.message}`);
    }
  }
}

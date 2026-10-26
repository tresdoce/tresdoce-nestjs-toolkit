import { Injectable } from '@nestjs/common';
import QRCode from 'qrcode';
import type { QRCodeToBufferOptions, QRCodeToDataURLOptions } from 'qrcode';

import type {
  QRCodeData,
  WiFiQR,
  VCardQR,
  EmailQR,
  SMSQR,
  GeoQR,
  EventQR,
  CryptoQR,
  WhatsappQR,
} from '../interfaces/qr-code.interface.js';
import {
  DEFAULT_QRCODE_OPTIONS_BUFFER,
  DEFAULT_QRCODE_OPTIONS_URL,
  QRCODE_MSG_ERROR_CREATE_QRCODE,
  QRCODE_MSG_INVALID_DATA_TYPE,
  QRCODE_MSG_URL_NOT_VALID,
} from '../constants/qr-code.constant.js';

type QRDataGenerators = {
  [K in QRCodeData['type']]: (_data: Extract<QRCodeData, { type: K }>) => string;
};

/**
 * Escapa los caracteres especiales del formato `WIFI:` (`\\`, `;`, `,`, `:` y `"`).
 */
const escapeWiFi = (_value: string): string => _value.replace(/([\\;,:"])/g, String.raw`\$1`);

/**
 * Escapa los caracteres especiales de un valor de texto vCard (RFC 6350) / iCalendar (RFC 5545).
 */
const escapeText = (_value: string): string =>
  _value
    .replaceAll('\\', String.raw`\\`)
    .replace(/([;,])/g, String.raw`\$1`)
    .replace(/\r?\n/g, String.raw`\n`);

@Injectable()
export class QrCodeService {
  private readonly qrDataGenerators: QRDataGenerators = {
    text: (_data) => _data.text,
    url: (_data) => this.validateUrl(_data.url),
    wifi: (_data) => this.generateWiFi(_data),
    vcard: (_data) => this.generateVCard(_data),
    email: (_data) => this.generateEmail(_data),
    sms: (_data) => this.generateSMS(_data),
    whatsapp: (_data) => this.generateWhatsapp(_data),
    geo: (_data) => this.generateGeo(_data),
    event: (_data) => this.generateEvent(_data),
    crypto: (_data) => this.generateCrypto(_data),
  };

  /**
   * Genera la cadena de datos a codificar según el tipo de QR.
   *
   * @param {QRCodeData} _data - Datos y tipo del QR a generar.
   * @param {string} [_prefix=''] - Prefijo para el mensaje de error.
   * @returns {string} Cadena a codificar en el QR.
   * @throws {Error} Si el tipo de dato no es soportado o los datos no son válidos.
   */
  private buildQrData(_data: QRCodeData, _prefix = ''): string {
    const type = _data?.type;
    if (!Object.hasOwn(this.qrDataGenerators, type)) {
      throw new Error(`${_prefix}${QRCODE_MSG_INVALID_DATA_TYPE}`);
    }
    const generateData = this.qrDataGenerators[type] as (_data: QRCodeData) => string;
    return generateData(_data);
  }

  /**
   * Valida si una URL es válida.
   *
   * @param {string} _url - URL a validar.
   * @returns {string} URL validada.
   * @throws {Error} Si la URL no es válida.
   */
  private validateUrl(_url: string): string {
    if (!URL.canParse(_url)) {
      throw new Error(QRCODE_MSG_URL_NOT_VALID);
    }
    return _url;
  }

  // Las siguientes funciones privadas generan la cadena de datos para diferentes tipos de QR

  private generateWiFi(_data: WiFiQR): string {
    const password = _data.encryption === 'nopass' ? '' : `P:${escapeWiFi(_data.password ?? '')};`;
    const hidden = _data.hidden ? 'H:true;' : '';
    return `WIFI:T:${_data.encryption};S:${escapeWiFi(_data.ssid)};${password}${hidden};`;
  }

  private generateVCard(_data: VCardQR): string {
    return `BEGIN:VCARD\nVERSION:3.0\nFN:${escapeText(_data.name)}\nORG:${escapeText(_data.organization)}\nTEL:${_data.phone}\nEMAIL:${_data.email}\nEND:VCARD`;
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
    // wa.me requiere el número en formato internacional, solo dígitos (sin `+`, espacios ni guiones).
    const phone = _data.phone.replace(/\D/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(_data.message)}`;
  }

  private generateGeo(_data: GeoQR): string {
    return `geo:${_data.latitude},${_data.longitude}`;
  }

  private generateEvent(_data: EventQR): string {
    return `BEGIN:VEVENT\nSUMMARY:${escapeText(_data.summary)}\nDTSTART:${_data.start}\nDTEND:${_data.end}\nEND:VEVENT`;
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
   *   currency: 'bitcoin',
   *   address: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT'
   * })
   */
  public async createQrCode(
    _data: QRCodeData,
    _options: QRCodeToDataURLOptions = {},
  ): Promise<string> {
    try {
      const qrData = this.buildQrData(_data);
      const qrOptions: QRCodeToDataURLOptions = { ...DEFAULT_QRCODE_OPTIONS_URL, ..._options };
      return await QRCode.toDataURL(qrData, qrOptions);
    } catch (_error) {
      throw new Error(`${QRCODE_MSG_ERROR_CREATE_QRCODE} ${_error.message}`, { cause: _error });
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
   *   currency: 'bitcoin',
   *   address: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT'
   * })
   */
  public async createQrCodeBuffer(
    _data: QRCodeData,
    _options: QRCodeToBufferOptions = {},
  ): Promise<Buffer> {
    try {
      const qrData = this.buildQrData(_data, '[Buffer] ');
      const qrOptions: QRCodeToBufferOptions = { ...DEFAULT_QRCODE_OPTIONS_BUFFER, ..._options };
      return await QRCode.toBuffer(qrData, qrOptions);
    } catch (_error) {
      throw new Error(`[Buffer] ${QRCODE_MSG_ERROR_CREATE_QRCODE} ${_error.message}`, {
        cause: _error,
      });
    }
  }
}

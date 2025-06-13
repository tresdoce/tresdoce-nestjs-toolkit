import { QRCodeToBufferOptions, QRCodeToDataURLOptions } from 'qrcode';
import { QRCodeData } from '../interfaces/qr-code.interface';
export declare class QrCodeService {
    private qrDataGenerators;
    /**
     * Valida si una URL es válida.
     *
     * @param {string} _url - URL a validar.
     * @returns {string} URL validada.
     * @throws {Error} Si la URL no es válida.
     */
    private validateUrl;
    /**
     * Determina si una cadena es una URL válida.
     *
     * @param {string} _url - La cadena a verificar.
     * @returns {boolean} True si la cadena es una URL válida, false en caso contrario.
     */
    private isValidUrl;
    private generateWiFi;
    private generateVCard;
    private generateEmail;
    private generateSMS;
    private generateWhatsapp;
    private generateGeo;
    private generateEvent;
    private generateCrypto;
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
    createQrCode(_data: QRCodeData, _options?: QRCodeToDataURLOptions): Promise<string>;
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
    createQrCodeBuffer(_data: QRCodeData, _options?: QRCodeToBufferOptions): Promise<Buffer>;
}

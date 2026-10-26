import type { QRCodeToBufferOptions, QRCodeToDataURLOptions } from 'qrcode';

export const QRCODE_MSG_URL_NOT_VALID = 'URL not valid';
export const QRCODE_MSG_INVALID_DATA_TYPE = 'Invalid QR Code data type';
export const QRCODE_MSG_ERROR_CREATE_QRCODE = 'Error creating QR code:';

/**
 * En Node.js `qrcode` solo renderiza data URLs PNG (`image/jpeg`/`image/webp` y `rendererOpts.quality`
 * solo aplican en el navegador con canvas), por eso el valor por defecto es `image/png`.
 */
export const DEFAULT_QRCODE_OPTIONS_URL: QRCodeToDataURLOptions = {
  type: 'image/png',
  errorCorrectionLevel: 'H',
  width: 200,
  margin: 2,
};

export const DEFAULT_QRCODE_OPTIONS_BUFFER: QRCodeToBufferOptions = {
  type: 'png',
  errorCorrectionLevel: 'H',
  width: 200,
  margin: 2,
};

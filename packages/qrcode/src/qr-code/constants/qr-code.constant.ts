import { QRCodeToBufferOptions, QRCodeToDataURLOptions } from 'qrcode';

export const QRCODE_MSG_URL_NOT_VALID = 'URL not valid';
export const QRCODE_MSG_INVALID_DATA_TYPE = 'Invalid QR Code data type';
export const QRCODE_MSG_ERROR_CREATE_QRCODE = 'Error creating QR code:';

export const DEFAULT_QRCODE_OPTIONS_URL: QRCodeToDataURLOptions = {
  type: 'image/jpeg',
  errorCorrectionLevel: 'H',
  width: 200,
  margin: 2,
  rendererOpts: {
    quality: 0.92,
  },
};

export const DEFAULT_QRCODE_OPTIONS_BUFFER: QRCodeToBufferOptions = {
  type: 'png',
  errorCorrectionLevel: 'H',
  width: 200,
  margin: 2,
};

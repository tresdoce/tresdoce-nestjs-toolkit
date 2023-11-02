// Texto Plano
export interface PlainTextQR {
  type: 'text';
  text: string;
}

// URLs
export interface URLQR {
  type: 'url';
  url: string;
}

// Datos de Wi-Fi
export interface WiFiQR {
  type: 'wifi';
  ssid: string;
  password: string;
  encryption: 'WEP' | 'WPA' | 'WPA2';
}

// VCard
export interface VCardQR {
  type: 'vcard';
  name: string;
  organization: string;
  phone: string;
  email: string;
}

// Correo Electrónico
export interface EmailQR {
  type: 'email';
  address: string;
  subject: string;
  body: string;
}

// SMS
export interface SMSQR {
  type: 'sms';
  phone: string;
  message: string;
}

// Whatsapp
export interface WhatsappQR {
  type: 'whatsapp';
  phone: string;
  message: string;
}

// Datos Geográficos
export interface GeoQR {
  type: 'geo';
  latitude: number;
  longitude: number;
}

// Eventos de Calendario
export interface EventQR {
  type: 'event';
  summary: string;
  start: string;
  end: string;
}

// Bitcoin y Otras Criptomonedas
export interface CryptoQR {
  type: 'crypto';
  address: string;
  currency: 'Bitcoin' | 'Ethereum' | 'Litecoin' | 'Other' | string;
}

// Unión de todos los tipos de QR
export type QRCodeData =
  | PlainTextQR
  | URLQR
  | WiFiQR
  | VCardQR
  | EmailQR
  | SMSQR
  | WhatsappQR
  | GeoQR
  | EventQR
  | CryptoQR;

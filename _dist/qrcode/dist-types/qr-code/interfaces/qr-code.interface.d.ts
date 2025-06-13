export interface PlainTextQR {
    type: 'text';
    text: string;
}
export interface URLQR {
    type: 'url';
    url: string;
}
export interface WiFiQR {
    type: 'wifi';
    ssid: string;
    password: string;
    encryption: 'WEP' | 'WPA' | 'WPA2';
}
export interface VCardQR {
    type: 'vcard';
    name: string;
    organization: string;
    phone: string;
    email: string;
}
export interface EmailQR {
    type: 'email';
    address: string;
    subject: string;
    body: string;
}
export interface SMSQR {
    type: 'sms';
    phone: string;
    message: string;
}
export interface WhatsappQR {
    type: 'whatsapp';
    phone: string;
    message: string;
}
export interface GeoQR {
    type: 'geo';
    latitude: number;
    longitude: number;
}
export interface EventQR {
    type: 'event';
    summary: string;
    start: string;
    end: string;
}
export interface CryptoQR {
    type: 'crypto';
    address: string;
    currency: string;
}
export type QRCodeData = PlainTextQR | URLQR | WiFiQR | VCardQR | EmailQR | SMSQR | WhatsappQR | GeoQR | EventQR | CryptoQR;

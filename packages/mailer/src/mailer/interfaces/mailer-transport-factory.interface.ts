import * as Mail from 'nodemailer/lib/mailer/index.js';
import { TransportType } from './mailer-options.interface.js';

export interface MailerTransportFactory {
  createTransport(opts?: TransportType): Mail;
}

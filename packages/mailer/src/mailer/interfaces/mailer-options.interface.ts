/** Interfaces **/
import { Transport, TransportOptions } from 'nodemailer';
import * as SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';
import * as SMTPPool from 'nodemailer/lib/smtp-pool/index.js';
import * as SendmailTransport from 'nodemailer/lib/sendmail-transport/index.js';
import * as StreamTransport from 'nodemailer/lib/stream-transport/index.js';
import * as JSONTransport from 'nodemailer/lib/json-transport/index.js';
import * as SESTransport from 'nodemailer/lib/ses-transport/index.js';

import { TemplateAdapter } from './template-adapter.interface.js';

type Options =
  | SMTPTransport.Options
  | SMTPPool.Options
  | SendmailTransport.Options
  | StreamTransport.Options
  | JSONTransport.Options
  | SESTransport.Options
  | TransportOptions;

export type TransportType =
  | Options
  | SMTPTransport
  | SMTPPool
  | SendmailTransport
  | StreamTransport
  | JSONTransport
  | SESTransport
  | Transport
  | string;

export interface MailerOptions {
  defaults?: Options;
  transport?: TransportType;
  transports?: {
    [name: string]: SMTPTransport | SMTPTransport.Options | string;
  };
  template?: {
    dir?: string;
    adapter?: TemplateAdapter;
    options?: { [name: string]: any };
  };
  options?: { [name: string]: any };
}

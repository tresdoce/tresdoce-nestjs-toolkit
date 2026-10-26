import { Inject } from '@nestjs/common';
import { createTransport } from 'nodemailer';

import { MAILER_OPTIONS } from '../constants/mailer.constant.js';
import { type MailerOptions, TransportType } from '../interfaces/mailer-options.interface.js';
import { MailerTransportFactory as IMailerTransportFactory } from '../interfaces/mailer-transport-factory.interface.js';

export class MailerTransportFactory implements IMailerTransportFactory {
  constructor(@Inject(MAILER_OPTIONS) private readonly options: MailerOptions) {}

  public createTransport(opts?: TransportType): any {
    return createTransport(opts || this.options.transport, this.options.defaults);
  }
}

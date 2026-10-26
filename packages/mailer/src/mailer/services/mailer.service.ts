import { Inject, Injectable, Optional } from '@nestjs/common';
import type { SentMessageInfo, Transporter } from 'nodemailer';

import { MAILER_OPTIONS, MAILER_TRANSPORT_FACTORY } from '../constants/mailer.constant.js';
import { MailerTransportFactory } from '../factories/mailer-transport.factory.js';

import type { MailerOptions } from '../interfaces/mailer-options.interface.js';
import type { TemplateAdapter } from '../interfaces/template-adapter.interface.js';
import type { ISendMailOptions } from '../interfaces/send-mail-options.interface.js';
import type { MailerTransportFactory as IMailerTransportFactory } from '../interfaces/mailer-transport-factory.interface.js';

@Injectable()
export class MailerService {
  private readonly transporter!: Transporter;
  private readonly transporters = new Map<string, Transporter>();

  constructor(
    @Inject(MAILER_OPTIONS) private readonly mailerOptions: MailerOptions,
    @Optional()
    @Inject(MAILER_TRANSPORT_FACTORY)
    private readonly transportFactory: IMailerTransportFactory,
  ) {
    if (!transportFactory) {
      this.transportFactory = new MailerTransportFactory(mailerOptions);
    }

    const hasTransport =
      !!mailerOptions?.transport && Object.keys(mailerOptions.transport).length > 0;
    if (!hasTransport && !mailerOptions?.transports) {
      throw new Error(
        'Make sure to provide a nodemailer transport configuration object, connection url or a transport plugin instance.',
      );
    }

    /** Adapter setup **/
    const templateAdapter: TemplateAdapter | undefined = this.mailerOptions.template?.adapter;

    /** Transporters setup **/
    if (mailerOptions.transports) {
      Object.keys(mailerOptions.transports).forEach((name) => {
        const transporter = this.transportFactory.createTransport(mailerOptions.transports[name]);
        this.transporters.set(name, transporter);
        this.initTemplateAdapter(templateAdapter, transporter);
      });
    }

    /** Transporter setup **/
    if (mailerOptions.transport) {
      this.transporter = this.transportFactory.createTransport();
      this.initTemplateAdapter(templateAdapter, this.transporter);
    }
  }

  private initTemplateAdapter(templateAdapter: TemplateAdapter, transporter: Transporter): void {
    if (templateAdapter) {
      transporter.use('compile', (mail, callback) => {
        if (mail.data.html) {
          return callback();
        }

        return templateAdapter.compile(mail, callback, this.mailerOptions);
      });
    }
  }

  public async sendMail(sendMailOptions: ISendMailOptions): Promise<SentMessageInfo> {
    if (sendMailOptions.transporterName) {
      const transporter = this.transporters.get(sendMailOptions.transporterName);
      if (!transporter) {
        throw new ReferenceError(
          `Transporters object doesn't have ${sendMailOptions.transporterName} key`,
        );
      }
      return transporter.sendMail(sendMailOptions);
    }

    if (!this.transporter) {
      throw new ReferenceError(`Transporter object undefined`);
    }
    return this.transporter.sendMail(sendMailOptions);
  }
}

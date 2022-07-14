import { Test, TestingModule } from '@nestjs/testing';
import { pathJoin } from '@tresdoce-nestjs-toolkit/test-utils';
import * as nodemailerMock from 'nodemailer-mock';
import MailMessage from 'nodemailer/lib/mailer/mail-message';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { MAILER_OPTIONS, MAILER_TRANSPORT_FACTORY } from '../mailer/constants/mailer.constant';

import { MailerOptions, TransportType } from '../mailer/interfaces/mailer-options.interface';
import { MailerTransportFactory } from '../mailer/interfaces/mailer-transport-factory.interface';

import { HandlebarsAdapter } from '../mailer/adapters/handlebars.adapter';
import { PugAdapter } from '../mailer/adapters/pug.adapter';
import { EjsAdapter } from '../mailer/adapters/ejs.adapter';

import { MailerService } from '../mailer/services/mailer.service';

const template_path = pathJoin(__dirname, 'utils/test-templates');

async function getMailerServiceForOptions(options: MailerOptions): Promise<MailerService> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        name: MAILER_OPTIONS,
        provide: MAILER_OPTIONS,
        useValue: options,
      },
      MailerService,
    ],
  }).compile();

  return module.get<MailerService>(MailerService);
}

function spyOnSmtpSend(onMail: (mail: MailMessage) => void) {
  return jest
    .spyOn(SMTPTransport.prototype, 'send')
    .mockImplementation(function (
      mail: MailMessage,
      callback: (err: Error | null, info: SMTPTransport.SentMessageInfo) => void,
    ): void {
      onMail(mail);
      callback(null, {
        envelope: {
          from: mail.data.from as string,
          to: [mail.data.to as string],
        },
        messageId: 'ABCD',
        accepted: [],
        rejected: [],
        pending: [],
        response: 'ok',
      });
    });
}

async function getMailerServiceWithCustomTransport(options: MailerOptions): Promise<MailerService> {
  class TestTransportFactory implements MailerTransportFactory {
    createTransport(options?: TransportType) {
      return nodemailerMock.createTransport({ host: 'localhost', port: -100 });
    }
  }

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        name: MAILER_OPTIONS,
        provide: MAILER_OPTIONS,
        useValue: options,
      },
      {
        name: MAILER_TRANSPORT_FACTORY,
        provide: MAILER_TRANSPORT_FACTORY,
        useClass: TestTransportFactory,
      },
      MailerService,
    ],
  }).compile();
  await module.init();

  return module.get<MailerService>(MailerService);
}

jest.setTimeout(70000);
describe('MailerService', () => {
  it('should not be defined if a transport is not provided', async () => {
    await expect(getMailerServiceForOptions({})).rejects.toMatchInlineSnapshot(
      `[Error: Make sure to provide a nodemailer transport configuration object, connection url or a transport plugin instance.]`,
    );
  });

  it('should accept a smtp transport string', async () => {
    const service = await getMailerServiceForOptions({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
    });

    expect(service).toBeDefined();
    expect((service as any).transporter.transporter).toBeInstanceOf(SMTPTransport);
  });

  it('should accept a smtp transports string', async () => {
    const service = await getMailerServiceForOptions({
      transports: {
        myDomain: 'smtps://user@domain.com:pass@smtp.domain.com',
      },
    });

    expect(service).toBeDefined();
    (service as any).transporters.forEach((value, key) => {
      expect(value.transporter).toBeInstanceOf(SMTPTransport);
    });
  });

  it('should accept smtp transport options', async () => {
    const service = await getMailerServiceForOptions({
      transport: {
        secure: true,
        auth: {
          user: 'user@domain.com',
          pass: 'pass',
        },
        options: {
          host: 'smtp.domain.com',
        },
      },
    });

    expect(service).toBeDefined();
    expect((service as any).transporter.transporter).toBeInstanceOf(SMTPTransport);
  });

  it('should accept a smtp transport instance', async () => {
    const transport = new SMTPTransport({});
    const service = await getMailerServiceForOptions({
      transport: transport,
    });

    expect(service).toBeDefined();
    expect((service as any).transporter.transporter).toBe(transport);
  });

  it('should send emails with nodemailer', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailerServiceForOptions({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
    });

    await service.sendMail({
      from: 'user1@example.test',
      to: 'user2@example.test',
      subject: 'Test',
      html: 'This is test.',
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail.data.from).toBe('user1@example.test');
    expect(lastMail.data.to).toBe('user2@example.test');
    expect(lastMail.data.subject).toBe('Test');
    expect(lastMail.data.html).toBe('This is test.');
  });

  it('should send emails with nodemailer transports', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailerServiceForOptions({
      transports: {
        myDomain: 'smtps://user@domain.com:pass@smtp.domain.com',
      },
    });

    await service.sendMail({
      transporterName: 'myDomain',
      from: 'user1@example.test',
      to: 'user2@example.test',
      subject: 'Test',
      html: 'This is test.',
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail.data.from).toBe('user1@example.test');
    expect(lastMail.data.to).toBe('user2@example.test');
    expect(lastMail.data.subject).toBe('Test');
    expect(lastMail.data.html).toBe('This is test.');
  });

  it('should send emails with nodemailer with different transports name', async () => {
    try {
      let lastMail: MailMessage;
      const send = spyOnSmtpSend((mail: MailMessage) => {
        lastMail = mail;
      });

      const service = await getMailerServiceForOptions({
        transports: {
          myDomain: 'smtps://user@domain.com:pass@smtp.domain.com',
        },
      });

      await service.sendMail({
        transporterName: 'testDomain',
        from: 'user1@example.test',
        to: 'user2@example.test',
        subject: 'Test',
        html: 'This is test.',
      });

      expect(send).toHaveBeenCalled();
    } catch (error) {
      expect(error.message).toBe("Transporters object doesn't have testDomain key");
    }
  });

  it('should send emails with nodemailer without transports', async () => {
    try {
      let lastMail: MailMessage;
      const send = spyOnSmtpSend((mail: MailMessage) => {
        lastMail = mail;
      });

      const service = await getMailerServiceForOptions({
        transports: {},
      });

      await service.sendMail({
        from: 'user1@example.test',
        to: 'user2@example.test',
        subject: 'Test',
        html: 'This is test.',
      });

      expect(send).toHaveBeenCalled();
    } catch (error) {
      expect(error.message).toBe('Transporter object undefined');
    }
  });

  it('should use mailerOptions.defaults when send emails', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailerServiceForOptions({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
      defaults: {
        from: 'user1@example.test',
      },
    });

    await service.sendMail({
      to: 'user2@example.test',
      subject: 'Test',
      html: 'This is test.',
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail.data.from).toBe('user1@example.test');
  });

  it('should use custom transport to send mail', async () => {
    const service = await getMailerServiceWithCustomTransport({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
    });
    await service.sendMail({
      to: 'user2@example.test',
      subject: 'Test',
      html: 'This is test.',
    });

    expect(nodemailerMock.mock.getSentMail().length).toEqual(1);
  });

  it('should compile template with the handlebars adapter', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        adapter: new HandlebarsAdapter(),
      },
    });

    await service.sendMail({
      from: 'user1@example.test',
      to: 'user2@example.test',
      subject: 'Test',
      template: `${template_path}/handlebars-template`,
      context: {
        MAILER: 'Nest-modules TM',
      },
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail.data.from).toBe('user1@example.test');
    expect(lastMail.data.html).toBe('<p>Handlebars test template. by Nest-modules TM</p>');
  });

  it('should compile template with the handlebars adapter with relative path', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        adapter: new HandlebarsAdapter(),
        dir: `${template_path}`,
      },
      options: {
        strict: true,
        partials: {
          dir: `${template_path}`,
        },
      },
    });

    await service.sendMail({
      from: 'user1@example.test',
      to: 'user2@example.test',
      subject: 'Test',
      template: `./handlebars-template`,
      context: {
        MAILER: 'Nest-modules TM',
      },
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail.data.from).toBe('user1@example.test');
    expect(lastMail.data.html).toBe('<p>Handlebars test template. by Nest-modules TM</p>');
  });

  it('should compile template with the handlebars adapter with error template path', async () => {
    let templatePath = pathJoin(template_path, '/handlebars-templates');
    try {
      let lastMail: MailMessage;
      const send = spyOnSmtpSend((mail: MailMessage) => {
        lastMail = mail;
      });

      const service = await getMailerServiceForOptions({
        transport: new SMTPTransport({}),
        template: {
          adapter: new HandlebarsAdapter(),
        },
      });

      await service.sendMail({
        from: 'user1@example.test',
        to: 'user2@example.test',
        subject: 'Test',
        template: `${templatePath}`,
        context: {
          MAILER: 'Nest-modules TM',
        },
      });

      expect(send).toHaveBeenCalled();
    } catch (error) {
      expect(error.message).toBe(
        `Error: ENOENT: no such file or directory, open '${templatePath}.hbs'`,
      );
    }
  });

  it('should compile template with the handlebars adapter with disabled inline-css', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    /*{
      myHelper: (context, value) => {
        console.log(context, value);
      },
    }*/

    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        adapter: new HandlebarsAdapter(undefined, { inlineCssEnabled: false }),
      },
    });

    await service.sendMail({
      from: 'user1@example.test',
      to: 'user2@example.test',
      subject: 'Test',
      template: `${template_path}/handlebars-template-media-query`,
      context: {
        MAILER: 'Nest-modules TM',
      },
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail.data.from).toBe('user1@example.test');
    expect(lastMail.data.html).toContain('@media only screen and (max-width:350px)');
    expect(lastMail.data.html).toContain('<p>Handlebars test template. by Nest-modules TM</p>');
  });

  it('should compile template with the handlebars adapter with enabled inline-css and media query', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        adapter: new HandlebarsAdapter(undefined, {
          inlineCssEnabled: true,
          inlineCssOptions: { url: ' ', preserveMediaQueries: true },
        }),
      },
    });

    await service.sendMail({
      from: 'user1@example.test',
      to: 'user2@example.test',
      subject: 'Test',
      template: `${template_path}/handlebars-template-media-query`,
      context: {
        MAILER: 'Nest-modules TM',
      },
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail.data.from).toBe('user1@example.test');
    expect(lastMail.data.html).toContain('@media only screen and (max-width:350px)');
    expect(lastMail.data.html).toContain('<p>Handlebars test template. by Nest-modules TM</p>');
  });

  it('should compile template with the pug adapter', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        adapter: new PugAdapter(),
      },
    });

    await service.sendMail({
      from: 'user1@example.test',
      to: 'user2@example.test',
      subject: 'Test',
      template: `${template_path}/pug-template`,
      context: {
        world: 'World',
      },
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail.data.from).toBe('user1@example.test');
    expect(lastMail.data.html).toBe('<p>Pug test template.</p><p>Hello World!</p>');
  });

  it('should compile template with the pug adapter with relative path', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        adapter: new PugAdapter(),
        dir: template_path,
      },
    });

    await service.sendMail({
      from: 'user1@example.test',
      to: 'user2@example.test',
      subject: 'Test',
      template: `./pug-template`,
      context: {
        world: 'World',
      },
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail.data.from).toBe('user1@example.test');
    expect(lastMail.data.html).toBe('<p>Pug test template.</p><p>Hello World!</p>');
  });

  it('should compile template with the pug adapter with error to read template', async () => {
    let templatePath = pathJoin(template_path, '/pug-templates');

    try {
      let lastMail: MailMessage;
      const send = spyOnSmtpSend((mail: MailMessage) => {
        lastMail = mail;
      });

      const service = await getMailerServiceForOptions({
        transport: new SMTPTransport({}),
        template: {
          adapter: new PugAdapter(),
        },
      });

      await service.sendMail({
        from: 'user1@example.test',
        to: 'user2@example.test',
        subject: 'Test',
        template: `${templatePath}`,
        context: {
          world: 'World',
        },
      });

      expect(send).toHaveBeenCalled();
    } catch (error) {
      expect(error.message).toBe(`ENOENT: no such file or directory, open '${templatePath}.pug'`);
    }
  });

  it('should compile template with the pug adapter without inline css', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        adapter: new PugAdapter({
          inlineCssEnabled: false,
        }),
      },
    });

    await service.sendMail({
      from: 'user1@example.test',
      to: 'user2@example.test',
      subject: 'Test',
      template: `${template_path}/pug-template`,
      context: {
        world: 'World',
      },
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail.data.from).toBe('user1@example.test');
    expect(lastMail.data.html).toBe('<p>Pug test template.</p><p>Hello World!</p>');
  });

  it('should compile template with the ejs adapter', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        adapter: new EjsAdapter(),
      },
    });

    await service.sendMail({
      from: 'user1@example.test',
      to: 'user2@example.test',
      subject: 'Test',
      template: `${template_path}/ejs-template`,
      context: {
        MAILER: 'Nest-modules TM',
      },
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail.data.from).toBe('user1@example.test');
    expect(lastMail.data.html).toBe('<p>Ejs test template. by Nest-modules TM</p>');
  });

  it('should compile template with the ejs adapter with error to read template', async () => {
    let templatePath = pathJoin(template_path, '/ejs-templates');
    try {
      let lastMail: MailMessage;
      const send = spyOnSmtpSend((mail: MailMessage) => {
        lastMail = mail;
      });

      const service = await getMailerServiceForOptions({
        transport: new SMTPTransport({}),
        template: {
          adapter: new EjsAdapter(),
        },
      });

      await service.sendMail({
        from: 'user1@example.test',
        to: 'user2@example.test',
        subject: 'Test',
        template: `${templatePath}`,
        context: {
          MAILER: 'Nest-modules TM',
        },
      });

      expect(send).toHaveBeenCalled();
    } catch (error) {
      expect(error.message).toBe(
        `Error: ENOENT: no such file or directory, open '${templatePath}.ejs'`,
      );
    }
  });

  it('should compile template with the ejs adapter read template relative url', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        dir: template_path,
        adapter: new EjsAdapter(),
      },
    });

    await service.sendMail({
      from: 'user1@example.test',
      to: 'user2@example.test',
      subject: 'Test',
      template: `./ejs-template`,
      context: {
        MAILER: 'Nest-modules TM',
      },
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail.data.from).toBe('user1@example.test');
    expect(lastMail.data.html).toBe('<p>Ejs test template. by Nest-modules TM</p>');
  });

  it('should compile template with the ejs adapter without css inline', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        adapter: new EjsAdapter({
          inlineCssEnabled: false,
        }),
      },
    });

    await service.sendMail({
      from: 'user1@example.test',
      to: 'user2@example.test',
      subject: 'Test',
      template: `${template_path}/ejs-template`,
      context: {
        MAILER: 'Nest-modules TM',
      },
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail.data.from).toBe('user1@example.test');
    expect(lastMail.data.html).toBe('<p>Ejs test template. by Nest-modules TM</p>');
  });

  it('should compile template with the ejs adapter with css inline', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        adapter: new EjsAdapter({
          inlineCssEnabled: true,
        }),
      },
    });

    await service.sendMail({
      from: 'user1@example.test',
      to: 'user2@example.test',
      subject: 'Test',
      template: `${template_path}/ejs-template`,
      context: {
        MAILER: 'Nest-modules TM',
      },
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail.data.from).toBe('user1@example.test');
    expect(lastMail.data.html).toBe('<p>Ejs test template. by Nest-modules TM</p>');
  });
});

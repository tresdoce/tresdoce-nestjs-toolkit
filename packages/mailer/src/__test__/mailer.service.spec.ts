import { Test, TestingModule } from '@nestjs/testing';
import { pathJoin } from '@tresdoce-nestjs-toolkit/test-utils';
import path from 'node:path';
import handlebars from 'handlebars';
import * as nodemailerMock from 'nodemailer-mock';
import MailMessage from 'nodemailer/lib/mailer/mail-message.js';
import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

import { MAILER_OPTIONS, MAILER_TRANSPORT_FACTORY } from '../mailer/constants/mailer.constant.js';

import { MailerOptions, TransportType } from '../mailer/interfaces/mailer-options.interface.js';
import { MailerTransportFactory } from '../mailer/interfaces/mailer-transport-factory.interface.js';

import { HandlebarsAdapter } from '../mailer/adapters/handlebars.adapter.js';
import { PugAdapter } from '../mailer/adapters/pug.adapter.js';
import { EjsAdapter } from '../mailer/adapters/ejs.adapter.js';

import { MailerService } from '../mailer/services/mailer.service.js';

const template_path = pathJoin(import.meta.dirname, 'utils/test-templates');

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
  return vi.spyOn(SMTPTransport.prototype, 'send').mockImplementation(function (
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
    createTransport(options?: TransportType): any {
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

vi.setConfig({ testTimeout: 70000 });
describe('MailerService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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
        requireTLS: true,
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
    const send = spyOnSmtpSend(() => undefined);

    const service = await getMailerServiceForOptions({
      transports: {
        myDomain: 'smtps://user@domain.com:pass@smtp.domain.com',
      },
    });

    await expect(
      service.sendMail({
        transporterName: 'testDomain',
        from: 'user1@example.test',
        to: 'user2@example.test',
        subject: 'Test',
        html: 'This is test.',
      }),
    ).rejects.toThrow("Transporters object doesn't have testDomain key");
    expect(send).not.toHaveBeenCalled();
  });

  it('should send emails with nodemailer without transports', async () => {
    const send = spyOnSmtpSend(() => undefined);

    const service = await getMailerServiceForOptions({
      transports: {},
    });

    await expect(
      service.sendMail({
        from: 'user1@example.test',
        to: 'user2@example.test',
        subject: 'Test',
        html: 'This is test.',
      }),
    ).rejects.toThrow('Transporter object undefined');
    expect(send).not.toHaveBeenCalled();
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
    expect(lastMail.data.html).toBe(
      '<html><head></head><body><p>Handlebars test template. by Nest-modules TM</p></body></html>',
    );
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
    expect(lastMail.data.html).toBe(
      '<html><head></head><body><p>Handlebars test template. by Nest-modules TM</p></body></html>',
    );
  });

  it('should compile template with the handlebars adapter with error template path', async () => {
    let templatePath = pathJoin(template_path, '/handlebars-templates');
    const send = spyOnSmtpSend(() => undefined);

    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        adapter: new HandlebarsAdapter(),
      },
    });

    await expect(
      service.sendMail({
        from: 'user1@example.test',
        to: 'user2@example.test',
        subject: 'Test',
        template: `${templatePath}`,
        context: {
          MAILER: 'Nest-modules TM',
        },
      }),
    ).rejects.toThrow(`ENOENT: no such file or directory, open '${templatePath}.hbs'`);
    expect(send).not.toHaveBeenCalled();
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
          inlineCssOptions: { keepStyleTags: true },
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
    expect(lastMail.data.html).toContain(
      '<style data-css-inline="keep" type="text/css">\n  @media only screen and (max-width:350px) { p { font-size: 20px; } }\n</style>',
    );
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
    expect(lastMail.data.html).toBe(
      '<html><head></head><body><p>Pug test template.</p><p>Hello World!</p></body></html>',
    );
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
    expect(lastMail.data.html).toBe(
      '<html><head></head><body><p>Pug test template.</p><p>Hello World!</p></body></html>',
    );
  });

  it('should compile template with the pug adapter with error to read template', async () => {
    let templatePath = pathJoin(template_path, '/pug-templates');

    const send = spyOnSmtpSend(() => undefined);

    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        adapter: new PugAdapter(),
      },
    });

    await expect(
      service.sendMail({
        from: 'user1@example.test',
        to: 'user2@example.test',
        subject: 'Test',
        template: `${templatePath}`,
        context: {
          world: 'World',
        },
      }),
    ).rejects.toThrow(`ENOENT: no such file or directory, open '${templatePath}.pug'`);
    expect(send).not.toHaveBeenCalled();
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
    expect(lastMail.data.html).toBe(
      '<html><head></head><body><p>Ejs test template. by Nest-modules TM</p></body></html>',
    );
  });

  it('should compile template with the ejs adapter with error to read template', async () => {
    let templatePath = pathJoin(template_path, '/ejs-templates');
    const send = spyOnSmtpSend(() => undefined);

    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        adapter: new EjsAdapter(),
      },
    });

    await expect(
      service.sendMail({
        from: 'user1@example.test',
        to: 'user2@example.test',
        subject: 'Test',
        template: `${templatePath}`,
        context: {
          MAILER: 'Nest-modules TM',
        },
      }),
    ).rejects.toThrow(`ENOENT: no such file or directory, open '${templatePath}.ejs'`);
    expect(send).not.toHaveBeenCalled();
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
    expect(lastMail.data.html).toBe(
      '<html><head></head><body><p>Ejs test template. by Nest-modules TM</p></body></html>',
    );
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
    expect(lastMail.data.html).toBe(
      '<html><head></head><body><p>Ejs test template. by Nest-modules TM</p></body></html>',
    );
  });

  it('should throw a descriptive error when mailer options are undefined', async () => {
    await expect(getMailerServiceForOptions(undefined)).rejects.toThrow(
      'Make sure to provide a nodemailer transport configuration object',
    );
  });

  it('should not share inline-css config between adapter instances', async () => {
    const mails: MailMessage[] = [];
    spyOnSmtpSend((mail: MailMessage) => {
      mails.push(mail);
    });

    new PugAdapter({ inlineCssEnabled: false });
    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: { adapter: new EjsAdapter() },
    });

    await service.sendMail({
      to: 'user2@example.test',
      template: `${template_path}/ejs-template`,
      context: { MAILER: 'Nest-modules TM' },
    });

    expect(mails.at(-1).data.html).toBe(
      '<html><head></head><body><p>Ejs test template. by Nest-modules TM</p></body></html>',
    );
  });

  it('should cache compiled templates and partials between sends', async () => {
    const mails: MailMessage[] = [];
    spyOnSmtpSend((mail: MailMessage) => {
      mails.push(mail);
    });
    const registerPartialSpy = vi.spyOn(handlebars, 'registerPartial');

    const handlebarsAdapter = new HandlebarsAdapter(undefined, { inlineCssEnabled: false });
    const ejsAdapter = new EjsAdapter({ inlineCssEnabled: false });
    const hbsService = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: { adapter: handlebarsAdapter, dir: template_path },
      options: { partials: { dir: template_path } },
    });
    const ejsService = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: { adapter: ejsAdapter, dir: template_path },
    });

    for (let i = 0; i < 2; i++) {
      await hbsService.sendMail({
        to: 'user2@example.test',
        template: './handlebars-template',
        context: { MAILER: `hbs-${i}` },
      });
      await ejsService.sendMail({
        to: 'user2@example.test',
        template: './ejs-template',
        context: { MAILER: `ejs-${i}` },
      });
    }

    expect(mails.map((mail) => mail.data.html)).toEqual([
      '<p>Handlebars test template. by hbs-0</p>',
      '<p>Ejs test template. by ejs-0</p>',
      '<p>Handlebars test template. by hbs-1</p>',
      '<p>Ejs test template. by ejs-1</p>',
    ]);
    // los partials se registran una sola vez por instancia del adapter
    expect(registerPartialSpy).toHaveBeenCalledTimes(3);
    expect(registerPartialSpy).toHaveBeenCalledWith(
      'partials/footer',
      expect.stringContaining('<footer>'),
    );
  });

  it('should render ejs templates with async option', async () => {
    let lastMail: MailMessage;
    spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        adapter: new EjsAdapter({ inlineCssEnabled: false }),
        options: { async: true },
      },
    });

    await service.sendMail({
      to: 'user2@example.test',
      template: `${template_path}/ejs-template`,
      context: { MAILER: 'async' },
    });

    expect(lastMail.data.html).toBe('<p>Ejs test template. by async</p>');
  });

  it('should reject when an async ejs template fails to render', async () => {
    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        adapter: new EjsAdapter(),
        options: { async: true },
      },
    });

    await expect(
      service.sendMail({
        to: 'user2@example.test',
        template: `${template_path}/ejs-template`,
        context: {},
      }),
    ).rejects.toThrow('MAILER is not defined');
  });

  it('should reject when a handlebars template fails to render', async () => {
    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    });

    await expect(
      service.sendMail({
        to: 'user2@example.test',
        template: `${template_path}/handlebars-template`,
        context: {},
      }),
    ).rejects.toThrow('"MAILER" not defined');
  });

  it('should reject when inline css fails', async () => {
    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: {
        adapter: new PugAdapter({ inlineCssOptions: { baseUrl: '::bad' } }),
      },
    });

    await expect(
      service.sendMail({
        to: 'user2@example.test',
        template: `${template_path}/pug-template`,
        context: { world: 'World' },
      }),
    ).rejects.toThrow('relative URL without a base');
  });

  it('should resolve relative templates against the cwd when template.dir is not set', async () => {
    let lastMail: MailMessage;
    spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: { adapter: new PugAdapter({ inlineCssEnabled: false }) },
    });

    await service.sendMail({
      to: 'user2@example.test',
      template: path.relative(process.cwd(), `${template_path}/pug-template`),
      context: { world: 'World' },
    });

    expect(lastMail.data.html).toBe('<p>Pug test template.</p><p>Hello World!</p>');
  });

  it('should register the concat and custom helpers in the handlebars adapter', () => {
    new HandlebarsAdapter({ upper: (value: string) => value.toUpperCase() });

    expect(handlebars.compile('{{concat "a" 1 "b"}}-{{upper "x"}}')({})).toBe('a1b-X');
  });

  it('should skip the template adapter when html is already provided', async () => {
    let lastMail: MailMessage;
    spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });
    const adapter = new PugAdapter();
    const compileSpy = vi.spyOn(adapter, 'compile');

    const service = await getMailerServiceForOptions({
      transport: new SMTPTransport({}),
      template: { adapter },
    });

    await service.sendMail({ to: 'user2@example.test', html: '<p>raw</p>' });

    expect(compileSpy).not.toHaveBeenCalled();
    expect(lastMail.data.html).toBe('<p>raw</p>');
  });
});

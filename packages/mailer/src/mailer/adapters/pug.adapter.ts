import { renderFile } from 'pug';

import type { MailerOptions } from '../interfaces/mailer-options.interface.js';
import type { TemplateAdapter } from '../interfaces/template-adapter.interface.js';
import type { TemplateAdapterConfig } from '../interfaces/template-adapter-config.interface.js';
import { applyRenderedHtml, buildAdapterConfig, getTemplatePath } from '../utils/utils.js';

export class PugAdapter implements TemplateAdapter {
  private readonly config: TemplateAdapterConfig;

  constructor(config?: TemplateAdapterConfig) {
    this.config = buildAdapterConfig(config);
  }

  public compile(mail: any, callback: (err?: any) => any, mailerOptions: MailerOptions): void {
    const { context, template } = mail.data;
    const templatePath = getTemplatePath(template, mailerOptions?.template?.dir, '.pug');

    const options = {
      ...context,
      ...mailerOptions?.template?.options,
    };

    renderFile(templatePath, options, (err, body) => {
      if (err) {
        return callback(err);
      }
      return applyRenderedHtml(mail, body, this.config, callback);
    });
  }
}

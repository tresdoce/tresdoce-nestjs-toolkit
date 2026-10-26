import ejs from 'ejs';

import type { MailerOptions } from '../interfaces/mailer-options.interface.js';
import type { TemplateAdapter } from '../interfaces/template-adapter.interface.js';
import type { TemplateAdapterConfig } from '../interfaces/template-adapter-config.interface.js';
import { applyRenderedHtml, buildAdapterConfig, getTemplatePath } from '../utils/utils.js';

export class EjsAdapter implements TemplateAdapter {
  private readonly config: TemplateAdapterConfig;

  constructor(config?: TemplateAdapterConfig) {
    this.config = buildAdapterConfig(config);
  }

  public compile(mail: any, callback: (err?: any) => any, mailerOptions: MailerOptions): void {
    const { context, template } = mail.data;
    const templatePath = getTemplatePath(template, mailerOptions?.template?.dir, '.ejs');

    // EJS reads the file itself and, with `cache: true`, compiles each template path only once.
    const options = { ...mailerOptions?.template?.options, cache: true };
    ejs.renderFile(templatePath, context, options, (error: Error | null, html?: string) => {
      if (error) return callback(error);
      applyRenderedHtml(mail, html, this.config, callback);
    });
  }
}

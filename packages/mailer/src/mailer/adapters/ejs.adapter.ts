import ejs from 'ejs';
import type { AsyncTemplateFunction, ClientFunction, TemplateFunction } from 'ejs';
import * as fs from 'node:fs';

import type { MailerOptions } from '../interfaces/mailer-options.interface.js';
import type { TemplateAdapter } from '../interfaces/template-adapter.interface.js';
import type { TemplateAdapterConfig } from '../interfaces/template-adapter-config.interface.js';
import { applyRenderedHtml, buildAdapterConfig, getTemplatePath } from '../utils/utils.js';

export class EjsAdapter implements TemplateAdapter {
  private precompiledTemplates: {
    [templatePath: string]: TemplateFunction | AsyncTemplateFunction | ClientFunction;
  } = {};

  private readonly config: TemplateAdapterConfig;

  constructor(config?: TemplateAdapterConfig) {
    this.config = buildAdapterConfig(config);
  }

  public compile(mail: any, callback: (err?: any) => any, mailerOptions: MailerOptions): void {
    const { context, template } = mail.data;
    const templatePath = getTemplatePath(template, mailerOptions?.template?.dir, '.ejs');

    let rendered: string | Promise<string>;
    try {
      if (!this.precompiledTemplates[templatePath]) {
        const templateEmail = fs.readFileSync(templatePath, 'utf-8');
        // The template comes from the app's own template directory (developer-controlled files),
        // never from request input: compiling it is the purpose of this adapter.
        this.precompiledTemplates[templatePath] = ejs.compile(templateEmail, {
          // NOSONAR
          ...mailerOptions?.template?.options,
          filename: templatePath,
        });
      }
      rendered = this.precompiledTemplates[templatePath](context);
    } catch (error) {
      return callback(error);
    }

    if (typeof rendered === 'string') {
      applyRenderedHtml(mail, rendered, this.config, callback);
    } else {
      rendered.then(
        (html) => applyRenderedHtml(mail, html, this.config, callback),
        (error) => callback(error),
      );
    }
  }
}

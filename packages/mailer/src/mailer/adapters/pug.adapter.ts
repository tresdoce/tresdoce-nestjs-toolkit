import _ from 'lodash';
import { renderFile } from 'pug';
import { inline } from '@css-inline/css-inline';

import { MailerOptions } from '../interfaces/mailer-options.interface';
import { TemplateAdapter } from '../interfaces/template-adapter.interface';
import { TemplateAdapterConfig } from '../interfaces/template-adapter-config.interface';
import { defaultConfigMailer, getTemplatePath } from '../utils/utils';

export class PugAdapter implements TemplateAdapter {
  private config: TemplateAdapterConfig = defaultConfigMailer;

  constructor(config?: TemplateAdapterConfig) {
    Object.assign(this.config, config);
  }

  public compile(mail: any, callback: any, mailerOptions: MailerOptions): void {
    const { context, template } = mail.data;
    const templatePath = getTemplatePath(template, mailerOptions, '.pug');

    const options = {
      ...context,
      ..._.get(mailerOptions, 'template.options', {}),
    };

    renderFile(templatePath, options, (err, body) => {
      if (err) {
        throw new Error(err.message);
      }

      if (this.config.inlineCssEnabled) {
        try {
          mail.data.html = inline(body, this.config.inlineCssOptions);
        } catch (_error) {
          /* istanbul ignore next */
          callback(_error);
        }
      } else {
        mail.data.html = body;
      }
      return callback();
    });
  }
}

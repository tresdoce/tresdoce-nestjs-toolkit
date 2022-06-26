import * as path from 'path';
import * as _ from 'lodash';
import { renderFile } from 'pug';
import inlineCss from 'inline-css';

import { MailerOptions } from '../interfaces/mailer-options.interface';
import { TemplateAdapter } from '../interfaces/template-adapter.interface';
import { TemplateAdapterConfig } from '../interfaces/template-adapter-config.interface';

export class PugAdapter implements TemplateAdapter {
  private config: TemplateAdapterConfig = {
    inlineCssOptions: { url: ' ' },
    inlineCssEnabled: true,
  };

  constructor(config?: TemplateAdapterConfig) {
    Object.assign(this.config, config);
  }

  public compile(mail: any, callback: any, mailerOptions: MailerOptions): void {
    const { context, template } = mail.data;
    const templateExt = path.extname(template) || '.pug';
    const templateName = path.basename(template, path.extname(template));
    const templateDir = path.isAbsolute(template)
      ? path.dirname(template)
      : path.join(_.get(mailerOptions, 'template.dir', ''), path.dirname(template));
    const templatePath = path.join(templateDir, templateName + templateExt);

    const options = {
      ...context,
      ..._.get(mailerOptions, 'template.options', {}),
    };

    renderFile(templatePath, options, (err, body) => {
      if (err) {
        return callback(err);
      }

      if (this.config.inlineCssEnabled) {
        inlineCss(body, this.config.inlineCssOptions)
          .then((html) => {
            mail.data.html = html;
            return callback();
          })
          .catch(callback);
      } else {
        mail.data.html = body;
        return callback();
      }
    });
  }
}

import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { inline } from '@css-inline/css-inline';
import * as glob from 'glob';
import _ from 'lodash';
import { HelperDeclareSpec } from 'handlebars';

import { MailerOptions } from '../interfaces/mailer-options.interface';
import { TemplateAdapter } from '../interfaces/template-adapter.interface';
import { TemplateAdapterConfig } from '../interfaces/template-adapter-config.interface';
import { defaultConfigMailer } from '../utils/utils';

export class HandlebarsAdapter implements TemplateAdapter {
  private precompiledTemplates: {
    [name: string]: handlebars.TemplateDelegate;
  } = {};

  private config: TemplateAdapterConfig = defaultConfigMailer;

  constructor(helpers?: HelperDeclareSpec, config?: TemplateAdapterConfig) {
    /* istanbul ignore next */
    handlebars.registerHelper('concat', (...args) => {
      args.pop();
      return args.join('');
    });
    handlebars.registerHelper(helpers || {});
    Object.assign(this.config, config);
  }

  public compile(mail: any, callback: any, mailerOptions: MailerOptions): void {
    const precompile = (template: any, _callback: any, options: any) => {
      const templateExt = path.extname(template) || '.hbs';
      const templateName = path.basename(template, path.extname(template));
      const templateDir = path.isAbsolute(template)
        ? path.dirname(template)
        : path.join(_.get(options, 'dir', ''), path.dirname(template));
      const templatePath = path.join(templateDir, `${templateName}${templateExt}`);

      if (!this.precompiledTemplates[templateName]) {
        try {
          const templateEmail = fs.readFileSync(templatePath, 'utf-8');
          this.precompiledTemplates[templateName] = handlebars.compile(
            templateEmail,
            _.get(options, 'options', {}),
          );
        } catch (err) {
          throw new Error(err);
        }
      }

      return {
        templateExt,
        templateName,
        templateDir,
        templatePath,
      };
    };

    const precompileTemplate = precompile(mail.data.template, callback, mailerOptions.template);

    const runtimeOptions = _.get(mailerOptions, 'options', {
      partials: false,
      data: {},
    });

    /* istanbul ignore next */
    if (runtimeOptions.partials) {
      const files = glob.sync(path.join(runtimeOptions.partials.dir, '**', '*.hbs'));
      files.forEach((file) => {
        const partialTemplate = precompile(file, callback, runtimeOptions.partials);
        const templateDir = path.relative(
          runtimeOptions.partials.dir,
          path.dirname(partialTemplate.templatePath),
        );
        handlebars.registerPartial(
          path.join(templateDir, partialTemplate.templateName),
          fs.readFileSync(partialTemplate.templatePath, 'utf-8'),
        );
      });
    }

    const rendered = this.precompiledTemplates[precompileTemplate.templateName](mail.data.context, {
      ...runtimeOptions,
      partials: this.precompiledTemplates,
    });

    if (this.config.inlineCssEnabled) {
      try {
        mail.data.html = inline(rendered, this.config.inlineCssOptions);
      } catch (_error) {
        /* istanbul ignore next */
        callback(_error);
      }
    } else {
      mail.data.html = rendered;
    }
    return callback();
  }
}

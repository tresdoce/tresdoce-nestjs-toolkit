import * as fs from 'node:fs';
import * as path from 'node:path';
import handlebars from 'handlebars';
import type { HelperDeclareSpec } from 'handlebars';

import type { MailerOptions } from '../interfaces/mailer-options.interface.js';
import type { TemplateAdapter } from '../interfaces/template-adapter.interface.js';
import type { TemplateAdapterConfig } from '../interfaces/template-adapter-config.interface.js';
import { applyRenderedHtml, buildAdapterConfig, getTemplatePath } from '../utils/utils.js';

export class HandlebarsAdapter implements TemplateAdapter {
  private precompiledTemplates: {
    [templatePath: string]: handlebars.TemplateDelegate;
  } = {};

  private partials: {
    [name: string]: handlebars.TemplateDelegate;
  } = {};

  private partialsRegistered = false;

  private readonly config: TemplateAdapterConfig;

  constructor(helpers?: HelperDeclareSpec, config?: TemplateAdapterConfig) {
    handlebars.registerHelper('concat', (...args: unknown[]) =>
      // el último argumento es el objeto `options` de handlebars
      args.slice(0, -1).map(String).join(''),
    );
    handlebars.registerHelper(helpers || {});
    this.config = buildAdapterConfig(config);
  }

  private precompile(
    templatePath: string,
    compileOptions?: CompileOptions,
  ): handlebars.TemplateDelegate {
    if (!this.precompiledTemplates[templatePath]) {
      const templateEmail = fs.readFileSync(templatePath, 'utf-8');
      this.precompiledTemplates[templatePath] = handlebars.compile(
        templateEmail,
        compileOptions ?? {},
      );
    }
    return this.precompiledTemplates[templatePath];
  }

  private registerPartials(partialsOptions: { dir: string; options?: CompileOptions }): void {
    const readPartials = (dir: string): string[] =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          return readPartials(entryPath);
        }
        return entry.isFile() && path.extname(entry.name) === '.hbs' ? [entryPath] : [];
      });

    readPartials(partialsOptions.dir).forEach((file) => {
      const templateName = path.basename(file, path.extname(file));
      const templateDir = path.relative(partialsOptions.dir, path.dirname(file));
      this.partials[templateName] = this.precompile(file, partialsOptions.options);
      handlebars.registerPartial(
        path.join(templateDir, templateName),
        fs.readFileSync(file, 'utf-8'),
      );
    });
    this.partialsRegistered = true;
  }

  public compile(mail: any, callback: (err?: any) => any, mailerOptions: MailerOptions): void {
    const runtimeOptions = mailerOptions?.options ?? { partials: false, data: {} };

    let rendered: string;
    try {
      const templatePath = getTemplatePath(
        mail.data.template,
        mailerOptions?.template?.dir,
        '.hbs',
      );
      const template = this.precompile(templatePath, mailerOptions?.template?.options);

      if (runtimeOptions.partials && !this.partialsRegistered) {
        this.registerPartials(runtimeOptions.partials);
      }

      rendered = template(mail.data.context, {
        ...runtimeOptions,
        partials: this.partials,
      });
    } catch (error) {
      return callback(error);
    }

    return applyRenderedHtml(mail, rendered, this.config, callback);
  }
}

type CompileOptions = Parameters<typeof handlebars.compile>[1];

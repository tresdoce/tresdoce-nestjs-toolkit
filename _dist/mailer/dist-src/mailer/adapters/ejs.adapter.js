import { compile } from 'ejs';
import _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import { inline } from '@css-inline/css-inline';
import { defaultConfigMailer, getTemplatePath } from '../utils/utils';
export class EjsAdapter {
    constructor(config) {
        this.precompiledTemplates = {};
        this.config = defaultConfigMailer;
        Object.assign(this.config, config);
    }
    compile(mail, callback, mailerOptions) {
        const { context, template } = mail.data;
        const templateName = path.basename(template, path.extname(template));
        const templatePath = getTemplatePath(template, mailerOptions, '.ejs');
        if (!this.precompiledTemplates[templateName]) {
            try {
                const templateEmail = fs.readFileSync(templatePath, 'utf-8');
                this.precompiledTemplates[templateName] = compile(templateEmail, {
                    ..._.get(mailerOptions, 'template.options', {}),
                    filename: templatePath,
                });
            }
            catch (err) {
                throw new Error(err);
            }
        }
        const rendered = this.precompiledTemplates[templateName](context);
        const render = (html) => {
            if (this.config.inlineCssEnabled) {
                try {
                    mail.data.html = inline(html, this.config.inlineCssOptions);
                }
                catch (_error) {
                    /* istanbul ignore next */
                    callback(_error);
                }
            }
            else {
                mail.data.html = html;
            }
            return callback();
        };
        /* istanbul ignore next */
        if (typeof rendered === 'string') {
            render(rendered);
        }
        else {
            rendered.then(render).catch((_error) => _error);
        }
    }
}

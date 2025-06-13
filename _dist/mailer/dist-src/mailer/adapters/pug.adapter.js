import _ from 'lodash';
import { renderFile } from 'pug';
import { inline } from '@css-inline/css-inline';
import { defaultConfigMailer, getTemplatePath } from '../utils/utils';
export class PugAdapter {
    constructor(config) {
        this.config = defaultConfigMailer;
        Object.assign(this.config, config);
    }
    compile(mail, callback, mailerOptions) {
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
                }
                catch (_error) {
                    /* istanbul ignore next */
                    callback(_error);
                }
            }
            else {
                mail.data.html = body;
            }
            return callback();
        });
    }
}

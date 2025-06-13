import path from 'path';
import _ from 'lodash';
export const getTemplatePath = (template, options, extension, templatePath = 'template.dir') => {
    const templateExt = path.extname(template) || extension;
    const templateName = path.basename(template, path.extname(template));
    const templateDir = path.isAbsolute(template)
        ? path.dirname(template)
        : path.join(_.get(options, templatePath, ''), path.dirname(template));
    return path.join(templateDir, `${templateName}${templateExt}`);
};
export const defaultConfigMailer = {
    inlineCssOptions: {},
    inlineCssEnabled: true,
};

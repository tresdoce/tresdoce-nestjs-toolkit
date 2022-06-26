import path from 'path';
import * as _ from 'lodash';
import { TemplateAdapterConfig } from '../interfaces/template-adapter-config.interface';

export const getTemplatePath = (
  template,
  options,
  extension,
  templatePath = 'template.dir',
): string => {
  const templateExt = path.extname(template) || extension;
  const templateName = path.basename(template, path.extname(template));
  const templateDir = path.isAbsolute(template)
    ? path.dirname(template)
    : path.join(_.get(options, templatePath, ''), path.dirname(template));
  return path.join(templateDir, `${templateName}${templateExt}`);
};

export const defaultConfigMailer: TemplateAdapterConfig = {
  inlineCssOptions: { url: ' ' },
  inlineCssEnabled: true,
};

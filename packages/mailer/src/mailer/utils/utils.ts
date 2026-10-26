import path from 'node:path';
import { inline } from '@css-inline/css-inline';

import type { TemplateAdapterConfig } from '../interfaces/template-adapter-config.interface.js';

/**
 * Resuelve la ruta absoluta de un template. Si `template` es relativo se resuelve contra `dir`.
 * Si no tiene extensión se usa `extension` por defecto.
 */
export const getTemplatePath = (
  template: string,
  dir: string | undefined,
  extension: string,
): string => {
  const templateExt = path.extname(template) || extension;
  const templateName = path.basename(template, path.extname(template));
  const templateDir = path.isAbsolute(template)
    ? path.dirname(template)
    : path.join(dir ?? '', path.dirname(template));
  return path.join(templateDir, `${templateName}${templateExt}`);
};

export const defaultConfigMailer: Readonly<TemplateAdapterConfig> = Object.freeze({
  inlineCssOptions: {},
  inlineCssEnabled: true,
});

/** Devuelve una configuración nueva por adapter (no muta `defaultConfigMailer`). */
export const buildAdapterConfig = (config?: TemplateAdapterConfig): TemplateAdapterConfig => ({
  ...defaultConfigMailer,
  ...config,
});

/**
 * Asigna el HTML renderizado al mail (aplicando inline CSS si está habilitado) y notifica a
 * nodemailer a través del `callback`. Cualquier error se propaga por el `callback` una sola vez.
 */
export const applyRenderedHtml = (
  mail: any,
  html: string,
  config: TemplateAdapterConfig,
  callback: (err?: any) => any,
): any => {
  try {
    mail.data.html = config.inlineCssEnabled ? inline(html, config.inlineCssOptions) : html;
  } catch (error) {
    return callback(error);
  }
  return callback();
};

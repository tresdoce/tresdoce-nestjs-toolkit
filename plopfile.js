import fs from 'node:fs';
import { dynamicModuleTemplate, basicPackageTemplate } from './plops/index.js';

const versionOf = (pkgPath) => JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version;

export default function config(plop) {
  plop.setGenerator('Dynamic Module template', dynamicModuleTemplate);
  plop.setGenerator('Basic package template', basicPackageTemplate);
  plop.setHelper('configVersion', () => versionOf('./packages/config/package.json'));
  plop.setHelper('typesVersion', () => versionOf('./packages/tresdoce-types/package.json'));
}

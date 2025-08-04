import path from 'path';
import fs from 'fs';

export class InjectShebangPlugin {
  private readonly filename: string;
  private readonly shebang: string;

  constructor(options: { filename?: string; shebang?: string } = {}) {
    this.filename = options.filename || 'main.js';
    this.shebang = options.shebang || '#!/usr/bin/env node';
  }

  apply(compiler: any): void {
    compiler.hooks.afterEmit.tap('InjectShebangPlugin', (): void => {
      const outputPath = path.join(compiler.options.output.path, this.filename);
      if (!fs.existsSync(outputPath)) return;

      const content: string = fs.readFileSync(outputPath, 'utf-8');
      if (content.startsWith(this.shebang)) return;

      fs.writeFileSync(outputPath, `${this.shebang}\n${content}`);
    });
  }
}

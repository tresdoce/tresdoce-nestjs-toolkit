import fs from 'fs';
import path from 'path';
import { InjectShebangPlugin } from '../build-config/cli-starter/plugins/inject-shebang.plugin';

describe('InjectShebangPlugin', () => {
  const testDir = path.join(__dirname, '__output__');
  const testFile = 'main.js';
  const testPath = path.join(testDir, testFile);
  const defaultShebang = '#!/usr/bin/env node';

  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  const createMockCompiler = (outputPath: string) => ({
    options: { output: { path: outputPath } },
    hooks: {
      afterEmit: {
        tap: (_name: string, fn: Function) => fn({}),
      },
    },
  });

  it('should inject the shebang if it is not present', () => {
    fs.writeFileSync(testPath, 'console.log("Hello world");');
    const plugin = new InjectShebangPlugin({ filename: testFile, shebang: defaultShebang });
    const mockCompiler = createMockCompiler(testDir);

    plugin.apply(mockCompiler as any);
    const result = fs.readFileSync(testPath, 'utf-8');
    expect(result.startsWith(defaultShebang)).toBe(true);
  });

  it('should not inject the shebang if it is already present', () => {
    fs.writeFileSync(testPath, `${defaultShebang}\nconsole.log("Hello world");`);
    const plugin = new InjectShebangPlugin({ filename: testFile, shebang: defaultShebang });
    const mockCompiler = createMockCompiler(testDir);

    plugin.apply(mockCompiler as any);
    const result = fs.readFileSync(testPath, 'utf-8');

    expect(result.startsWith(defaultShebang)).toBe(true);
    expect(result.match(new RegExp(defaultShebang, 'g'))?.length).toBe(1);
  });

  it('should do nothing if the file does not exist', () => {
    const plugin = new InjectShebangPlugin({ filename: testFile, shebang: defaultShebang });
    const mockCompiler = createMockCompiler(testDir);

    expect(() => plugin.apply(mockCompiler as any)).not.toThrow();
    expect(fs.existsSync(testPath)).toBe(false);
  });

  it('should use default values if no options are provided', () => {
    const plugin = new InjectShebangPlugin();
    const defaultPath = path.join(testDir, 'main.js');

    fs.writeFileSync(defaultPath, 'console.log("Default config");');
    const mockCompiler = createMockCompiler(testDir);

    plugin.apply(mockCompiler as any);
    const result = fs.readFileSync(defaultPath, 'utf-8');

    expect(result.startsWith(defaultShebang)).toBe(true);
  });

  it('should use "main.js" as default filename if no filename is provided', () => {
    const plugin = new InjectShebangPlugin({ shebang: defaultShebang });
    const defaultPath = path.join(testDir, 'main.js');

    fs.writeFileSync(defaultPath, 'console.log("No filename");');
    const mockCompiler = createMockCompiler(testDir);

    plugin.apply(mockCompiler as any);
    const result = fs.readFileSync(defaultPath, 'utf-8');

    expect(result.startsWith(defaultShebang)).toBe(true);
  });

  it('should use "#!/usr/bin/env node" as default shebang if no shebang is provided', () => {
    const plugin = new InjectShebangPlugin({ filename: testFile });
    fs.writeFileSync(testPath, 'console.log("No shebang");');
    const mockCompiler = createMockCompiler(testDir);

    plugin.apply(mockCompiler as any);
    const result = fs.readFileSync(testPath, 'utf-8');

    expect(result.startsWith(defaultShebang)).toBe(true);
  });
});

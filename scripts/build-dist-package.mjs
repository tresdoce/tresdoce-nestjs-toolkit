#!/usr/bin/env node
// Runs after `tsc -p tsconfig.build.json` has emitted a package into dist/<name>.
// Writes the published package.json (ESM-only) and copies docs and non-TS assets.
import fs from 'node:fs';
import path from 'node:path';

const pkgDir = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));

const distDir = pkg.publishConfig?.directory;
if (!distDir) {
  throw new Error(`publishConfig.directory missing in ${pkgDir}/package.json`);
}
const distPath = path.resolve(pkgDir, distDir);
if (!fs.existsSync(distPath)) {
  throw new Error(`${distPath} does not exist: run tsc before this script`);
}

const { directory: _directory, ...publishConfig } = pkg.publishConfig;

const distPkg = {
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  license: pkg.license,
  author: pkg.author,
  keywords: pkg.keywords,
  homepage: pkg.homepage,
  bugs: pkg.bugs,
  repository: pkg.repository,
  type: 'module',
  main: './index.js',
  types: './index.d.ts',
  exports: {
    '.': { types: './index.d.ts', default: './index.js' },
    './package.json': './package.json',
  },
  dependencies: pkg.dependencies,
  ...(pkg.peerDependencies ? { peerDependencies: pkg.peerDependencies } : {}),
  ...(pkg.peerDependenciesMeta ? { peerDependenciesMeta: pkg.peerDependenciesMeta } : {}),
  publishConfig,
};

fs.writeFileSync(path.join(distPath, 'package.json'), `${JSON.stringify(distPkg, null, 2)}\n`);

for (const file of ['README.md', 'CHANGELOG.md', 'license.md', 'LICENSE.md']) {
  const src = path.join(pkgDir, file);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(distPath, file));
}

// tsc only emits .js/.d.ts: copy any other file shipped under src/ (e.g. docker-compose.yml).
const srcRoot = path.join(pkgDir, 'src');
const copyAssets = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const from = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__test__') continue;
      copyAssets(from);
    } else if (!/\.(ts|tsx)$/.test(entry.name) && entry.name !== '.DS_Store') {
      const to = path.join(distPath, path.relative(srcRoot, from));
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
    }
  }
};
if (fs.existsSync(srcRoot)) copyAssets(srcRoot);

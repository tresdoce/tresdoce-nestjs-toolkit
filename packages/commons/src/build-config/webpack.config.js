const path = require('path');
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');

// In a plain (non-monorepo) install, dependencies live in the app's own
// ./node_modules, which webpack-node-externals finds by default. In a
// yarn/pnpm workspace, they're typically hoisted to the monorepo root
// instead, so that default scan finds nothing and webpack ends up trying
// to bundle node_modules packages like @nestjs/terminus — which breaks on
// its dynamic require() of .d.ts/.js.map files. Resolving this file's own
// already-required dependency (webpack-node-externals, unscoped, so its
// package.json sits directly inside node_modules) locates the *real*
// node_modules directory regardless of hoisting depth, so both cases
// externalize correctly with the same config.
const hoistedNodeModules = path.dirname(
  path.dirname(require.resolve('webpack-node-externals/package.json')),
);

module.exports = () => {
  const isBuildMode = process.env.NODE_ENV === 'build';
  return {
    entry: './src/main.ts',
    mode: isBuildMode ? 'production' : 'development',
    target: 'node',
    externalsPresets: { node: true },
    externals: [nodeExternals(), nodeExternals({ modulesDir: hoistedNodeModules })],
    output: {
      filename: 'main.js',
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [{ loader: 'ts-loader', options: { transpileOnly: true } }],
        },
      ],
    },
    optimization: {
      minimize: isBuildMode,
      minimizer: isBuildMode
        ? [
            new TerserPlugin({
              extractComments: false,
              terserOptions: {
                keep_classnames: true,
                keep_fnames: true,
                compress: {
                  drop_console: true,
                },
              },
            }),
          ]
        : [],
      nodeEnv: isBuildMode ? 'production' : false,
    },
    devtool: isBuildMode ? false : 'source-map',
  };
};

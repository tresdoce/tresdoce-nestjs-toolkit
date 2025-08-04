const TerserPlugin = require('terser-webpack-plugin');
const { InjectShebangPlugin } = require('./plugins/inject-shebang.plugin');
const webpackConfig = require('../webpack.config');

module.exports = () => {
  const isBuildMode = process.env.NODE_ENV === 'build';
  return {
    ...webpackConfig(),
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
                  drop_console: false,
                },
              },
            }),
          ]
        : [],
      nodeEnv: isBuildMode ? 'production' : false,
    },
    plugins: [
      new InjectShebangPlugin({
        filename: 'main.js',
        shebang: '#!/usr/bin/env node',
      }),
    ],
  };
};

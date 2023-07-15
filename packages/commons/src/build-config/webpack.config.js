const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (options) => {
  const isProductionMode = process.env.NODE_ENV === 'build';
  return {
    ...options,
    entry: './src/main.ts',
    mode: isProductionMode ? 'production' : 'development',
    target: 'node',
    externals: [nodeExternals()],
    output: {
      ...options.output,
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
          use: ['ts-loader'],
        },
      ],
    },
    optimization: {
      ...options.optimization,
      minimize: isProductionMode,
      minimizer: isProductionMode
        ? [
            new TerserPlugin({
              terserOptions: {
                keep_classnames: true,
                keep_fnames: true,
              },
            }),
          ]
        : [],
      nodeEnv: isProductionMode ? 'production' : false,
    },
    devtool: isProductionMode ? 'hidden-source-map' : 'source-map',
  };
};

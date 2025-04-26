const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = () => {
  const isBuildMode = process.env.NODE_ENV === 'build';
  return {
    entry: './src/main.ts',
    mode: isBuildMode ? 'production' : 'development',
    target: 'node',
    externalsPresets: { node: true },
    externals: [nodeExternals()],
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
              terserOptions: {
                keep_classnames: true,
                keep_fnames: true,
              },
            }),
          ]
        : [],
      nodeEnv: isBuildMode ? 'production' : false,
    },
    devtool: isBuildMode ? false : 'source-map',
  };
};

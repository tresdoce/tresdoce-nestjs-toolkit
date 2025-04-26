import { merge } from 'webpack-merge';
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');

const commonConfig = {
  entry: './src/main.ts',
  target: 'node',
  externals: [nodeExternals()],
  externalsPresets: { node: true },
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
        exclude: [/node_modules/],
        use: [{ loader: 'ts-loader', options: { transpileOnly: true } }],
      },
    ],
  },
};

const devConfig = {
  mode: 'development',
  devtool: 'source-map',
  optimization: {
    minimize: false,
    nodeEnv: false,
  },
};

const prodConfig = {
  mode: 'production',
  devtool: false,
  optimization: {
    minimize: true,
    nodeEnv: 'production',
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
        },
      }),
    ],
  },
};

export const buildConfig = (additionalConfig = {}, options = { externalizeNodeModules: true }) => {
  const isBuildMode = process.env.NODE_ENV === 'build';
  const specificConfig = isBuildMode ? prodConfig : devConfig;

  const commonConfigAdjusted = {
    ...commonConfig,
    externals: options.externalizeNodeModules ? [nodeExternals()] : [],
  };

  return merge(commonConfigAdjusted, specificConfig, additionalConfig);
};

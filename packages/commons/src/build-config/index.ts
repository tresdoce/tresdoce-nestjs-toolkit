const isBuild = process.env.NODE_ENV === 'build';

export const buildConfig = (options) => ({
  ...options,
  mode: isBuild ? 'production' : 'none',
  output: {
    ...options.output,
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  optimization: {
    ...options.optimization,
    minimize: false,
    nodeEnv: isBuild ? 'production' : false,
  },
});

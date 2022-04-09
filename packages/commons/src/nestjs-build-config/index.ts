const isBuild = process.env.NODE_ENV === 'build';

export const buildConfig = (options) => ({
  ...options,
  /* istanbul ignore next */
  mode: isBuild ? 'production' : 'none',
  output: {
    ...options.output,
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  optimization: {
    ...options.optimization,
    minimize: false,
    /* istanbul ignore next */
    nodeEnv: isBuild ? 'production' : false,
  },
});

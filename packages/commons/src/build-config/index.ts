export const buildConfig = (options) => {
  const isBuild = process.env.NODE_ENV === 'build';
  return {
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
  };
};

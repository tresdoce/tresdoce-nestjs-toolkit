'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var webpackMerge = require('webpack-merge');

const eslintConfig = () => ({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
  //'plugin:@typescript-eslint/eslint-recommended',
  'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  root: true,
  env: {
    node: true,
    jest: true
  },
  ignorePatterns: ['.eslintrc.js', '**/__test__/**/*'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-require-imports': 'off'
  }
});

function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}

const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');
const commonConfig = {
  entry: './src/main.ts',
  target: 'node',
  externals: [nodeExternals()],
  externalsPresets: {
    node: true
  },
  output: {
    filename: 'main.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: [/node_modules/],
      use: [{
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        }
      }]
    }]
  }
};
const devConfig = {
  mode: 'development',
  devtool: 'source-map',
  optimization: {
    minimize: false,
    nodeEnv: false
  }
};
const prodConfig = {
  mode: 'production',
  devtool: false,
  optimization: {
    minimize: true,
    nodeEnv: 'production',
    minimizer: [new TerserPlugin({
      terserOptions: {
        keep_classnames: true,
        keep_fnames: true
      }
    })]
  }
};
const buildConfig = (additionalConfig = {}, options = {
  externalizeNodeModules: true
}) => {
  const isBuildMode = process.env.NODE_ENV === 'build';
  const specificConfig = isBuildMode ? prodConfig : devConfig;
  const commonConfigAdjusted = _objectSpread2(_objectSpread2({}, commonConfig), {}, {
    externals: options.externalizeNodeModules ? [nodeExternals()] : []
  });
  return webpackMerge.merge(commonConfigAdjusted, specificConfig, additionalConfig);
};

const jestConfig = () => ({
  moduleFileExtensions: ['js', 'json', 'ts'],
  forceExit: true,
  verbose: true,
  rootDir: '.',
  testRegex: '.*\\.(spec|it|test|e2e|e2e-spec)\\.(t|j)s$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  roots: ['<rootDir>/test/', '<rootDir>/src/'],
  collectCoverage: true,
  collectCoverageFrom: ['**/*.(t|j)s', '!**/*.entity.(t|j)s'],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['node_modules', 'node_modules/*', 'dist', 'dist/*', 'src/main.ts', 'src/*/entities/*'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.ts', 'jest-extended/all'],
  moduleDirectories: ['node_modules'],
  preset: 'ts-jest',
  testResultsProcessor: 'jest-sonar-reporter',
  displayName: `${process.env.npm_package_name}`,
  coverageReporters: ['html', 'text', 'text-summary', 'cobertura', 'clover', 'json', 'lcov'],
  reporters: ['default', ['jest-junit', {
    classNameTemplate: `{classname}`,
    titleTemplate: '{title}',
    ancestorSeparator: ' › ',
    //suiteNameTemplate: `${process.env.npm_package_name}`,
    uniqueOutputName: 'false',
    suiteNameTemplate: '{filepath}',
    includeConsoleOutput: true,
    addFileAttribute: 'true'
  }]],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
});

exports.buildConfig = buildConfig;
exports.eslintConfig = eslintConfig;
exports.jestConfig = jestConfig;
//# sourceMappingURL=index.js.map

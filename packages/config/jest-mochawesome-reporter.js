const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const fs = require('fs');
const { v4: uuid } = require('uuid');

const buildMargeInput = (_results) => {
  let input = {};
  const elapsed = buildElapsedTime(_results.testResults);
  const results = createResults(_results.testResults);

  input.stats = {
    suites: _results.numTotalTestSuites,
    tests: _results.numTotalTests,
    passes: _results.numPassedTests,
    pending: _results.numPendingTests,
    failures: _results.numFailedTests,
    testsRegistered: _results.numTotalTests,
    passPercent: (_results.numPassedTests * 100) / _results.numTotalTests,
    pendingPercent: (_results.numPendingTests * 100) / _results.numTotalTests,
    other: 0,
    hasOther: false,
    skipped: 0,
    hasSkipped: false,
    start: new Date(_results.startTime),
    end: new Date(_results.startTime + elapsed),
    duration: elapsed,
  };
  input.results = [results];

  return input;
};

const createResults = (_results) => {
  const suite = createPackageSuite(_results);
  return {
    ...createSuite(true),
    uuid: uuid(),
    suites: [suite],
  };
};

const hasAncestorsTitles = (testResults) =>
  testResults &&
  testResults.length > 0 &&
  testResults.some((test) => test.ancestorTitles && test.ancestorTitles.length > 0);

const groupByAncestor = (_testResults, _testFilePath, _savePath) =>
  _testResults.reduce((_acc, _value) => {
    const [ancestorTitles, ...restAncestors] = _value.ancestorTitles;
    _value.ancestorTitles = restAncestors;
    const previousSuites = _acc.find((elem) => elem.title === ancestorTitles);

    if (previousSuites) {
      previousSuites.tempSuites.push(_value);
    } else {
      _acc.push({
        ...createSuite(),
        uuid: uuid(),
        title: ancestorTitles || '',
        fullFile: `${_testFilePath}`,
        file: `${_savePath ? _testFilePath.split('/').pop() : ''}`,
        tempSuites: [_value],
      });
    }
    return _acc;
  }, []);

const mapChildSuites = (_testResults, _testFile, _savePath = true) => {
  let suites = groupByAncestor(_testResults, _testFile.path, _savePath);

  suites = suites.map((_suit) => {
    if (hasAncestorsTitles(_suit.tempSuites)) {
      _suit.suites = mapChildSuites(_suit.tempSuites, _testFile, false);
      delete _suit.tempSuites;
    } else {
      _suit.tests = _suit.tempSuites.map((_tempSuites) =>
        createTest(_tempSuites, _suit, _testFile.content),
      );
      _suit.duration = getTestDuration(_suit.tests);
      _suit.passes = getUUIDByStatus(_suit.tests, (_test) => _test.pass);
      _suit.failures = getUUIDByStatus(_suit.tests, (_test) => _test.fail);
      _suit.pending = getUUIDByStatus(_suit.tests, (_test) => _test.pending);
      delete _suit.tempSuites;
    }
    return _suit;
  });

  return suites;
};

const createPackageSuite = (_results) => {
  const suites = _results
    .map((_package) => {
      const testFileContent = fs.readFileSync(_package.testFilePath, 'utf8');
      return mapChildSuites(_package.testResults, {
        content: testFileContent,
        path: _package.testFilePath,
      });
    })
    .flat();
  return {
    ...createSuite(),
    uuid: uuid(),
    title: `${_results[0].displayName?.name || ''}`,
    suites,
  };
};

const createTest = (_result, _suit, _testFileContent = null) => {
  return {
    fullTitle: `${_result.fullName}`,
    title: `${_result.title}`,
    timedOut: false,
    duration: _result.duration,
    state: _result.status,
    speed: testSpeed(_result.duration),
    pass: passed(_result),
    fail: failed(_result),
    pending: pending(_result),
    context: null,
    code: findTestCase(_result.title, _suit.title, _testFileContent),
    err: getErrorTest(_result),
    uuid: uuid(),
    parentUUID: _suit.uuid,
    isHook: false,
    skipped: false,
  };
};

const createSuite = (_isRoot = false) => {
  return {
    uuid: '',
    title: '',
    fullFile: '',
    file: '',
    beforeHooks: [],
    afterHooks: [],
    tests: [],
    suites: [],
    passes: [],
    failures: [],
    pending: [],
    skipped: [],
    duration: 0,
    root: _isRoot,
    rootEmpty: _isRoot,
    _timeout: 5000,
  };
};

const findTestCase = (_testCaseName, _suitTitle, _testFileContent) => {
  const ast = parser.parse(_testFileContent, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
  let testCaseCode = '';
  let hasDescribe = false;

  traverse(ast, {
    CallExpression(path) {
      if (
        path.node.callee.name === 'describe' ||
        (path.node.callee.object && path.node.callee.object.name === 'describe')
      ) {
        const describeArg = path.node.arguments[0];
        hasDescribe = describeArg && describeArg.value === _suitTitle;
      }

      if (
        hasDescribe &&
        (path.node.callee.name === 'test' ||
          path.node.callee.name === 'it' ||
          (path.node.callee.object && path.node.callee.object.name === 'test') ||
          (path.node.callee.object && path.node.callee.object.name === 'it'))
      ) {
        const firstArg = path.node.arguments[0];

        if (firstArg && firstArg.value === _testCaseName) {
          testCaseCode = _testFileContent.slice(path.node.start, path.node.end);
          hasDescribe = false;
        }
      }
    },
  });

  return testCaseCode;
};

const testSpeed = (_duration) => {
  const duration = parseInt(_duration);
  if (duration <= 100) {
    return 'fast';
  } else if (duration <= 1000) {
    return 'medium';
  } else if (duration > 1000) {
    return 'slow';
  } else {
    return null;
  }
};

const passed = (_test) => _test.status === 'passed';

const failed = (_test) => _test.status === 'failed';

const pending = (_test) => _test.status === 'pending';

const getErrorTest = (_result) => {
  return _result.status === 'failed'
    ? {
        message: _result.failureDetails[0].matcherResult.message.replace(/\x1b\[\d+m/g, '') || null,
        estack:
          _result.failureDetails.map((msg) => msg.stack.replace(/\x1b\[\d+m/g, '')).join('\n') ||
          null,
        diff: _result.failureDetails[0].matcherResult.message.replace(/\x1b\[\d+m/g, '') || null,
      }
    : {};
};

const buildElapsedTime = (_results) => {
  return _results.reduce((_sum, _results) => {
    return _sum + _results.testResults.reduce((_sum, test) => _sum + test.duration, 0);
  }, 0);
};

const getTestDuration = (_tests) => _tests.reduce((sum, test) => sum + test.duration, 0);

const getUUIDByStatus = (_tests, _passed) => _tests.filter(_passed).map((obj) => obj.uuid);

const checkOrCreateReportDir = (_reportDir) => {
  if (!fs.existsSync(_reportDir)) {
    fs.mkdirSync(_reportDir, (_error) => {
      if (_error) throw _error;
      console.log('Report dir has been created.');
    });
  }
};

const writeOutput = (_payload, _filepath) => {
  fs.writeFileSync(`${_filepath}`, JSON.stringify(_payload, null, 2), (_error) => {
    if (_error) {
      console.error(_error);
      throw _error;
    }
    console.log('file saved');
  });
};

class JestMochawesomeReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(_contexts, _results) {
    if (_results.testResults.length) {
      const { reportDir = null, reportFilename = 'jest-mochawesome.json' } = this._options;

      if (reportDir !== null) {
        checkOrCreateReportDir(`${this._globalConfig.rootDir}/${reportDir}`);
      }
      const reportDirectory = reportDir !== null ? `/${reportDir}` : '';
      const filePathReport = `${this._globalConfig.rootDir}${reportDirectory}/${reportFilename}`;

      writeOutput(buildMargeInput(_results), filePathReport);
    }
  }
}

module.exports = JestMochawesomeReporter;

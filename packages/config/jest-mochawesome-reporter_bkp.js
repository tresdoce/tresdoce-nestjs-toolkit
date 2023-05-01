const fs = require('fs');
const { v4: uuid } = require('uuid');

const buildMargeInput = (_results) => {
  console.log('_RESULTS: ', _results);
  let input = {};
  const elapsed = buildElapsedTime(_results.testResults);
  //const results = createResults(_results.testResults);
  const results = [];
  input.stats = {
    suites: _results.numTotalTestSuites,
    tests: _results.numTotalTests,
    passes: _results.numPassedTests,
    pending: _results.numPendingTests,
    failures: _results.numFailedTests,
    start: new Date(_results.startTime), // Jest does epochs
    end: new Date(_results.startTime + elapsed),
    duration: elapsed,
    testsRegistered: _results.numTotalTests,
    passPercent: (_results.numPassedTests * 100) / _results.numTotalTests,
    pendingPercent: (_results.numPendingTests * 100) / _results.numTotalTests,
    other: 0,
    hasOther: false,
    skipped: 0,
    hasSkipped: false,
  };
  input.results = results;
  return input;
};

const createResults = (_results) => {
  console.log('CREATE RESULTS: ', _results);
  //_results = _results[0];
  let id = uuid();
  //let suites = _results.testResults.map(createSuite);
  return {
    uuid: id,
    title: '',
    fullFile: _results.testFilePath,
    file: _results.testFilePath.split('/').pop(),
    beforeHooks: [],
    afterHooks: [],
    tests: [],
    suites: [], //suites,
    passes: [],
    failures: [],
    pending: [],
    skipped: [],
    duration: 0,
    root: true,
    rootEmpty: true,
    _timeout: 5000,
  };
};

const createSuite = (_suite) => {
  console.log('CREATE SUITE: ', _suite);
  let id = uuid();
  let tests = _suite.testResults.map((_test) => {
    return createTest(_test, id);
  });
  let passes = tests.filter((_test) => _test.pass).map((_test) => _test.uuid);
  let failures = tests.filter((_test) => _test.fail).map((_test) => _test.uuid);
  let pending = tests.filter((_test) => _test.pending).map((_test) => _test.uuid);

  return {
    uuid: id,
    title: _suite.testResults[0].ancestorTitles[0],
    fullFile: _suite.testFilePath,
    file: _suite.testFilePath.split('/').pop(),
    beforeHooks: [],
    afterHooks: [],
    tests: tests,
    suites: [],
    passes: passes,
    failures: failures,
    pending: pending,
    skipped: [],
    duration: _suite.perfStats.end - _suite.perfStats.start,
    root: false,
    rootEmpty: false,
    _timeout: 5000,
  };
};

const createTest = (_test, _parentId) => {
  console.log('CREATE TEST: ', _test);
  return {
    title: _test.title,
    fullTitle: fullTitle(_test),
    timedOut: false,
    duration: _test.duration,
    state: _test.status,
    speed: null,
    pass: passed(_test),
    fail: failed(_test),
    pending: pending(_test),
    context: null,
    code: '',
    err:
      _test.status === 'passed'
        ? {}
        : {
            message: _test.failureDetails[0].matcherResult.message,
            estack: _test.failureMessages,
            diff: null,
          },
    uuid: uuid(),
    parentUUID: _parentId,
    isHook: false,
    skipped: false,
    //isRoot: false,
  };
};

const passed = (_test) => {
  return _test.status === 'passed';
};

const failed = (_test) => {
  return _test.status === 'failed';
};

const pending = (_test) => {
  return _test.status === 'pending';
};

const fullTitle = (_test) => {
  if (_test.fullName) {
    return _test.fullName;
  }
  return _test.ancestorTitles.reduce((_sum, _val) => _sum + _val + ' ', '');
};

const buildElapsedTime = (_suites) => {
  return _suites.reduce((_sum, _suite) => {
    return _sum + _suite.testResults.reduce((_sum, test) => _sum + test.duration, 0);
  }, 0);
};

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

/**
 * TODO: Extend BaseReporter
 */
class JestMochawesomeReporter {
  // extends BaseReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(_contexts, _results) {
    const { reportDir = null, reportFilename = 'jest-mochawesome.json' } = this._options;
    const report = buildMargeInput(_results);

    if (reportDir !== null) {
      checkOrCreateReportDir(`${this._globalConfig.rootDir}/${reportDir}`);
    }

    writeOutput(
      report,
      `${this._globalConfig.rootDir}${reportDir !== null ? `/${reportDir}` : ''}/${reportFilename}`,
    );
  }
}

module.exports = JestMochawesomeReporter;

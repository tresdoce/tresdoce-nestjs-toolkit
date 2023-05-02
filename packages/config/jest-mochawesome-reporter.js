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

  _results.testResults.forEach((testResult) => {
    testResult.testResults.forEach((result) => {
      const id = uuid();
      const testFilePath = testResult.testFilePath;
      const testFileContent = fs.readFileSync(testFilePath, 'utf8') || '';

      const test = {
        title: `${testResult.testResults[0].ancestorTitles.join(' > ')} > ${result.title}`,
        fullTitle: result.title,
        timedOut: false,
        duration: result.duration,
        state: result.status,
        speed: null,
        pass: passed(result),
        fail: failed(result),
        pending: pending(result),
        context: null,
        code: testFileContent,
        err:
          result.status === 'failed'
            ? {
                message: result.failureDetails.map((msg) => msg.message.replace(/\x1b\[\d+m/g, '')),
                stackTrace: result.failureDetails
                  .map((msg) => msg.stack.replace(/\x1b\[\d+m/g, ''))
                  .join('\n'),
                diff: null,
              }
            : {},
        uuid: id,
        parentUUID: input.results[0].suites[0].uuid,
        isHook: false,
        skipped: false,
      };

      input.results[0].suites[0].tests.push(test);
    });
  });

  input.results[0].suites[0].duration = getTestDuration(input);
  input.results[0].suites[0].passes = getUUIDByStatus(input, 'passed');
  input.results[0].suites[0].failures = getUUIDByStatus(input, 'failed');
  input.results[0].suites[0].pending = getUUIDByStatus(input, 'pending');

  return input;
};

const buildElapsedTime = (_suites) => {
  return _suites.reduce((_sum, _suite) => {
    return _sum + _suite.testResults.reduce((_sum, test) => _sum + test.duration, 0);
  }, 0);
};

const createResults = (_results) => {
  const id = uuid();
  const suite = createSuite(_results);
  return {
    uuid: id,
    title: `${_results[0].displayName?.name || ''}`,
    fullFile: '',
    file: '',
    beforeHooks: [],
    afterHooks: [],
    tests: [],
    suites: suite,
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
  const id = uuid();

  return [
    {
      uuid: id,
      title: `${_suite[0].displayName?.name || ''}`,
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
      root: false,
      rootEmpty: false,
      _timeout: 5000,
    },
  ];
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

const getTestDuration = (_input) => {
  return _input.results[0].suites[0].tests.reduce((sum, test) => sum + test.duration, 0);
};

const getUUIDByStatus = (_input, _state) => {
  return _input.results[0].suites[0].tests
    .filter((obj) => obj.state === `${_state}`)
    .map((obj) => obj.uuid);
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

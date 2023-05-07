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

  //console.log('RESULTS: ', _results);

  // RECORRE ARCHIVO x ARCHIVO
  _results.testResults.forEach((_testResult, _indexTestResult) => {
    //console.log(`TEST RESULT ${_indexTestResult}`, _testResult);
    const testFileContent = getFileContent(_testResult);

    // RECORRE DESCRIBE e ITS
    _testResult.testResults.forEach((_result, _indexTest) => {
      //console.log(`TEST ${_indexTest}`, _result);
      const parentUUID = input.results[0].suites[0].uuid;
      const test = createTest(_result, parentUUID, testFileContent);

      input.results[0].suites[0].tests.push(test);
    });
  });

  input.results[0].suites[0].duration = getTestDuration(input);
  input.results[0].suites[0].passes = getUUIDByStatus(input, 'passed');
  input.results[0].suites[0].failures = getUUIDByStatus(input, 'failed');
  input.results[0].suites[0].pending = getUUIDByStatus(input, 'pending');

  return input;
};

const createResults = (_results) => {
  const suite = createSuite(_results);
  return {
    uuid: uuid(),
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

const createSuite = (_results) => {
  return [
    {
      uuid: uuid(),
      title: `${_results[0].displayName?.name || ''}`,
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

const createTest = (_result, _parentUUID, _testFileContent = null) => {
  return {
    fullTitle: `${_result.ancestorTitles.join(' > ')} > ${_result.title}`,
    title: `${_result.ancestorTitles.join(' > ')} > ${_result.title}`,
    //title: result.title,
    timedOut: false,
    duration: _result.duration,
    state: _result.status,
    speed: testSpeed(_result.duration),
    pass: passed(_result),
    fail: failed(_result),
    pending: pending(_result),
    context: null,
    code: _testFileContent,
    err: getErrorTest(_result),
    uuid: uuid(),
    parentUUID: _parentUUID,
    isHook: false,
    skipped: false,
  };
};

const getFileContent = (_results) => {
  const { testFilePath } = _results;
  return fs.readFileSync(testFilePath, 'utf8') || '';
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

const getTestDuration = (_input) =>
  _input.results[0].suites[0].tests.reduce((sum, test) => sum + test.duration, 0);

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
